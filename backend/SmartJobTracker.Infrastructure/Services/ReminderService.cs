using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartJobTracker.Core.DTOs;
using SmartJobTracker.Core.Entities;
using SmartJobTracker.Core.Interfaces;
using SmartJobTracker.Infrastructure.Data;

namespace SmartJobTracker.Infrastructure.Services
{
    public class ReminderService : IReminderService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public ReminderService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<IEnumerable<ReminderDto>> GetUserRemindersAsync(Guid userId, bool includePast = false)
        {
            var query = _context.Reminders
                .Include(r => r.Application!)
                .ThenInclude(a => a.Job)
                .Include(r => r.Interview)
                .Where(r => r.UserId == userId);

            if (!includePast)
            {
                query = query.Where(r => r.ScheduledDate >= DateTime.UtcNow || !r.IsSent);
            }

            var reminders = await query.OrderBy(r => r.ScheduledDate).ToListAsync();

            return reminders.Select(r => new ReminderDto
            {
                Id = r.Id,
                ApplicationId = r.ApplicationId,
                InterviewId = r.InterviewId,
                Title = r.Title,
                Message = r.Message,
                ScheduledDate = r.ScheduledDate,
                IsSent = r.IsSent,
                Type = r.Type,
                Company = r.Application?.Job?.Company,
                JobTitle = r.Application?.Job?.JobTitle,
                CreatedAt = r.CreatedAt
            });
        }

        public async Task<ReminderDto> CreateAsync(Guid userId, CreateReminderDto dto)
        {
            var reminder = new Reminder
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ApplicationId = dto.ApplicationId,
                InterviewId = dto.InterviewId,
                Title = dto.Title.Trim(),
                Message = dto.Message,
                ScheduledDate = dto.ScheduledDate,
                IsSent = false,
                Type = dto.Type,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Reminders.AddAsync(reminder);
            await _context.SaveChangesAsync();

            return new ReminderDto
            {
                Id = reminder.Id,
                ApplicationId = reminder.ApplicationId,
                InterviewId = reminder.InterviewId,
                Title = reminder.Title,
                Message = reminder.Message,
                ScheduledDate = reminder.ScheduledDate,
                IsSent = reminder.IsSent,
                Type = reminder.Type,
                CreatedAt = reminder.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid reminderId)
        {
            var reminder = await _context.Reminders.FirstOrDefaultAsync(r => r.Id == reminderId && r.UserId == userId);
            if (reminder == null) return false;

            _context.Reminders.Remove(reminder);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task ProcessDueRemindersAsync()
        {
            var dueReminders = await _context.Reminders
                .Include(r => r.User)
                .Include(r => r.Application!)
                .ThenInclude(a => a.Job)
                .Include(r => r.Interview)
                .Where(r => !r.IsSent && r.ScheduledDate <= DateTime.UtcNow)
                .ToListAsync();

            foreach (var r in dueReminders)
            {
                if (r.User != null)
                {
                    if (r.Interview != null)
                    {
                        await _emailService.SendInterviewReminderEmailAsync(
                            r.User.Email,
                            r.User.FullName,
                            r.Application?.Job?.Company ?? "Company",
                            r.Application?.Job?.JobTitle ?? "Job Position",
                            r.Interview.Round,
                            r.Interview.InterviewDate,
                            r.Interview.MeetingLinkOrLocation);
                    }
                    else
                    {
                        await _emailService.SendEmailAsync(
                            r.User.Email,
                            $"Reminder: {r.Title}",
                            $"<p>Hi {r.User.FullName},</p><p>{r.Message}</p>");
                    }
                }

                r.IsSent = true;
            }

            if (dueReminders.Any())
            {
                await _context.SaveChangesAsync();
            }
        }
    }
}
