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
    public class JobApplicationService : IJobApplicationService
    {
        private readonly AppDbContext _context;

        public JobApplicationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobApplicationDto>> GetApplicationsAsync(Guid userId, ApplicationFilterDto filter)
        {
            var query = _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Resume)
                .Include(a => a.Interviews)
                .Where(a => a.UserId == userId)
                .AsQueryable();

            // Search
            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var term = filter.Search.Trim().ToLower();
                query = query.Where(a => a.Job!.Company.ToLower().Contains(term) ||
                                         a.Job.JobTitle.ToLower().Contains(term) ||
                                         a.Job.Location.ToLower().Contains(term));
            }

            // Status Filter
            if (filter.Status.HasValue)
            {
                query = query.Where(a => a.Status == filter.Status.Value);
            }

            // Source Filter
            if (!string.IsNullOrWhiteSpace(filter.Source))
            {
                query = query.Where(a => a.Job!.ApplicationSource == filter.Source);
            }

            // Date Filters
            if (filter.FromDate.HasValue)
            {
                query = query.Where(a => a.AppliedDate >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(a => a.AppliedDate <= filter.ToDate.Value);
            }

            // Sorting
            bool isDesc = filter.SortOrder?.ToLower() == "desc";
            query = filter.SortBy?.ToLower() switch
            {
                "salary" => isDesc ? query.OrderByDescending(a => a.Job!.Salary) : query.OrderBy(a => a.Job!.Salary),
                "company" => isDesc ? query.OrderByDescending(a => a.Job!.Company) : query.OrderBy(a => a.Job!.Company),
                "title" => isDesc ? query.OrderByDescending(a => a.Job!.JobTitle) : query.OrderBy(a => a.Job!.JobTitle),
                _ => isDesc ? query.OrderByDescending(a => a.AppliedDate) : query.OrderByDescending(a => a.AppliedDate)
            };

            var applications = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return applications.Select(MapToDto);
        }

        public async Task<JobApplicationDto?> GetByIdAsync(Guid userId, Guid applicationId)
        {
            var app = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Resume)
                .Include(a => a.Interviews)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId);

            return app == null ? null : MapToDto(app);
        }

        public async Task<JobApplicationDto> CreateAsync(Guid userId, CreateApplicationDto dto)
        {
            var job = new Job
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Company = dto.Company.Trim(),
                JobTitle = dto.JobTitle.Trim(),
                Location = dto.Location.Trim(),
                Salary = dto.Salary,
                JobUrl = dto.JobUrl,
                ApplicationSource = string.IsNullOrWhiteSpace(dto.ApplicationSource) ? "LinkedIn" : dto.ApplicationSource,
                CreatedAt = DateTime.UtcNow
            };

            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                JobId = job.Id,
                UserId = userId,
                ResumeId = dto.ResumeId,
                AppliedDate = dto.AppliedDate == default ? DateTime.UtcNow : dto.AppliedDate,
                Status = dto.Status,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Jobs.AddAsync(job);
            await _context.Applications.AddAsync(application);
            await _context.SaveChangesAsync();

            return (await GetByIdAsync(userId, application.Id))!;
        }

        public async Task<JobApplicationDto?> UpdateAsync(Guid userId, Guid applicationId, UpdateApplicationDto dto)
        {
            var app = await _context.Applications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId);

            if (app == null || app.Job == null) return null;

            app.Job.Company = dto.Company.Trim();
            app.Job.JobTitle = dto.JobTitle.Trim();
            app.Job.Location = dto.Location.Trim();
            app.Job.Salary = dto.Salary;
            app.Job.JobUrl = dto.JobUrl;
            app.Job.ApplicationSource = dto.ApplicationSource;

            app.AppliedDate = dto.AppliedDate;
            app.Status = dto.Status;
            app.ResumeId = dto.ResumeId;
            app.Notes = dto.Notes;
            app.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(userId, applicationId);
        }

        public async Task<bool> UpdateStatusAsync(Guid userId, Guid applicationId, ApplicationStatus status)
        {
            var app = await _context.Applications.FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId);
            if (app == null) return false;

            app.Status = status;
            app.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid applicationId)
        {
            var app = await _context.Applications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == applicationId && a.UserId == userId);

            if (app == null) return false;

            _context.Applications.Remove(app);
            if (app.Job != null)
            {
                _context.Jobs.Remove(app.Job);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private static JobApplicationDto MapToDto(JobApplication app)
        {
            return new JobApplicationDto
            {
                Id = app.Id,
                JobId = app.JobId,
                UserId = app.UserId,
                Company = app.Job?.Company ?? string.Empty,
                JobTitle = app.Job?.JobTitle ?? string.Empty,
                Location = app.Job?.Location ?? string.Empty,
                Salary = app.Job?.Salary,
                JobUrl = app.Job?.JobUrl,
                ApplicationSource = app.Job?.ApplicationSource ?? string.Empty,
                AppliedDate = app.AppliedDate,
                Status = app.Status,
                ResumeId = app.ResumeId,
                ResumeTitle = app.Resume?.Title,
                Notes = app.Notes,
                TotalInterviews = app.Interviews?.Count ?? 0,
                CreatedAt = app.CreatedAt,
                UpdatedAt = app.UpdatedAt
            };
        }
    }
}
