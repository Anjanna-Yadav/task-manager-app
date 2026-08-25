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
    public class InterviewService : IInterviewService
    {
        private readonly AppDbContext _context;

        public InterviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InterviewDto>> GetUserInterviewsAsync(Guid userId)
        {
            var interviews = await _context.Interviews
                .Include(i => i.Application!)
                .ThenInclude(a => a.Job)
                .Where(i => i.UserId == userId)
                .OrderByDescending(i => i.InterviewDate)
                .ToListAsync();

            return interviews.Select(MapToDto);
        }

        public async Task<IEnumerable<InterviewDto>> GetApplicationInterviewsAsync(Guid userId, Guid applicationId)
        {
            var interviews = await _context.Interviews
                .Include(i => i.Application!)
                .ThenInclude(a => a.Job)
                .Where(i => i.UserId == userId && i.ApplicationId == applicationId)
                .OrderBy(i => i.InterviewDate)
                .ToListAsync();

            return interviews.Select(MapToDto);
        }

        public async Task<InterviewDto?> GetByIdAsync(Guid userId, Guid interviewId)
        {
            var interview = await _context.Interviews
                .Include(i => i.Application!)
                .ThenInclude(a => a.Job)
                .FirstOrDefaultAsync(i => i.Id == interviewId && i.UserId == userId);

            return interview == null ? null : MapToDto(interview);
        }

        public async Task<InterviewDto> CreateAsync(Guid userId, CreateInterviewDto dto)
        {
            var application = await _context.Applications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == dto.ApplicationId && a.UserId == userId);

            if (application == null)
            {
                throw new InvalidOperationException("Associated job application not found.");
            }

            var interview = new Interview
            {
                Id = Guid.NewGuid(),
                ApplicationId = dto.ApplicationId,
                UserId = userId,
                InterviewDate = dto.InterviewDate,
                Round = dto.Round.Trim(),
                Interviewer = dto.Interviewer.Trim(),
                MeetingLinkOrLocation = dto.MeetingLinkOrLocation,
                Notes = dto.Notes,
                Result = dto.Result,
                CreatedAt = DateTime.UtcNow
            };

            // Auto-update application status to Interview if currently Applied/Screening
            if (application.Status == ApplicationStatus.Applied || application.Status == ApplicationStatus.Screening)
            {
                application.Status = ApplicationStatus.Interview;
                application.UpdatedAt = DateTime.UtcNow;
            }

            await _context.Interviews.AddAsync(interview);

            // Optional Follow-up Reminder creation
            if (dto.SetFollowUpReminder && dto.InterviewDate > DateTime.UtcNow)
            {
                var reminder = new Reminder
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    ApplicationId = dto.ApplicationId,
                    InterviewId = interview.Id,
                    Title = $"Upcoming Interview: {application.Job?.Company} - {dto.Round}",
                    Message = $"Prepare for {dto.Round} interview with {dto.Interviewer}.",
                    ScheduledDate = dto.InterviewDate.AddHours(-2), // 2 hours prior
                    IsSent = false,
                    Type = ReminderType.Interview,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Reminders.AddAsync(reminder);
            }

            await _context.SaveChangesAsync();

            return (await GetByIdAsync(userId, interview.Id))!;
        }

        public async Task<InterviewDto?> UpdateAsync(Guid userId, Guid interviewId, UpdateInterviewDto dto)
        {
            var interview = await _context.Interviews
                .Include(i => i.Application!)
                .ThenInclude(a => a.Job)
                .FirstOrDefaultAsync(i => i.Id == interviewId && i.UserId == userId);

            if (interview == null) return null;

            interview.InterviewDate = dto.InterviewDate;
            interview.Round = dto.Round.Trim();
            interview.Interviewer = dto.Interviewer.Trim();
            interview.MeetingLinkOrLocation = dto.MeetingLinkOrLocation;
            interview.Notes = dto.Notes;
            interview.Result = dto.Result;

            await _context.SaveChangesAsync();

            return MapToDto(interview);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid interviewId)
        {
            var interview = await _context.Interviews.FirstOrDefaultAsync(i => i.Id == interviewId && i.UserId == userId);
            if (interview == null) return false;

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();
            return true;
        }

        private static InterviewDto MapToDto(Interview i)
        {
            return new InterviewDto
            {
                Id = i.Id,
                ApplicationId = i.ApplicationId,
                Company = i.Application?.Job?.Company ?? string.Empty,
                JobTitle = i.Application?.Job?.JobTitle ?? string.Empty,
                InterviewDate = i.InterviewDate,
                Round = i.Round,
                Interviewer = i.Interviewer,
                MeetingLinkOrLocation = i.MeetingLinkOrLocation,
                Notes = i.Notes,
                Result = i.Result,
                CreatedAt = i.CreatedAt
            };
        }
    }
}
