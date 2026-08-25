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
    public class AnalyticsService : IAnalyticsService
    {
        private readonly AppDbContext _context;

        public AnalyticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId)
        {
            var userApps = await _context.Applications
                .Include(a => a.Interviews)
                .Where(a => a.UserId == userId)
                .ToListAsync();

            int totalApps = userApps.Count;
            int totalInterviews = userApps.Sum(a => a.Interviews?.Count ?? 0);
            int totalSelected = userApps.Count(a => a.Status == ApplicationStatus.Selected);
            int totalRejected = userApps.Count(a => a.Status == ApplicationStatus.Rejected);

            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            int appsThisMonth = userApps.Count(a => a.AppliedDate >= startOfMonth);

            var upcomingInterviewsCount = await _context.Interviews
                .Where(i => i.UserId == userId && i.InterviewDate >= DateTime.UtcNow && i.Result == InterviewResult.Scheduled)
                .CountAsync();

            double conversionRate = totalApps > 0 ? Math.Round((double)userApps.Count(a => a.Interviews != null && a.Interviews.Any()) / totalApps * 100, 1) : 0;
            double selectionRate = totalApps > 0 ? Math.Round((double)totalSelected / totalApps * 100, 1) : 0;

            // Velocity calculation (Days to First Interview)
            var appsWithInterviews = userApps.Where(a => a.Interviews != null && a.Interviews.Any()).ToList();
            double avgDaysToInterview = 0;
            if (appsWithInterviews.Any())
            {
                var daysList = appsWithInterviews.Select(a =>
                {
                    var firstInterview = a.Interviews!.OrderBy(i => i.InterviewDate).First();
                    var diff = (firstInterview.InterviewDate - a.AppliedDate).TotalDays;
                    return diff < 0 ? 0 : diff;
                }).ToList();

                avgDaysToInterview = Math.Round(daysList.Average(), 1);
            }

            return new DashboardSummaryDto
            {
                TotalApplications = totalApps,
                TotalInterviews = totalInterviews,
                TotalSelected = totalSelected,
                TotalRejected = totalRejected,
                ApplicationsThisMonth = appsThisMonth,
                InterviewsUpcoming = upcomingInterviewsCount,
                InterviewConversionRate = conversionRate,
                SelectionRate = selectionRate,
                AverageDaysToInterview = avgDaysToInterview
            };
        }

        public async Task<JobAnalyticsDto> GetJobAnalyticsAsync(Guid userId)
        {
            var summary = await GetDashboardSummaryAsync(userId);

            var userApps = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.Interviews)
                .Where(a => a.UserId == userId)
                .ToListAsync();

            // Status Breakdown
            var statusBreakdown = Enum.GetValues<ApplicationStatus>()
                .ToDictionary(
                    s => s.ToString(),
                    s => userApps.Count(a => a.Status == s)
                );

            // Source Analytics
            var sourceGroups = userApps.GroupBy(a => string.IsNullOrWhiteSpace(a.Job?.ApplicationSource) ? "Other" : a.Job.ApplicationSource);
            var topSources = sourceGroups.Select(g =>
            {
                int count = g.Count();
                int interviews = g.Sum(a => a.Interviews?.Count ?? 0);
                int selected = g.Count(a => a.Status == ApplicationStatus.Selected);
                double successRate = count > 0 ? Math.Round((double)selected / count * 100, 1) : 0;

                return new SourceAnalyticsDto
                {
                    Source = g.Key,
                    ApplicationCount = count,
                    InterviewCount = interviews,
                    SelectedCount = selected,
                    SuccessRate = successRate
                };
            }).OrderByDescending(s => s.ApplicationCount).ToList();

            // Monthly Trends (Last 6 months)
            var monthlyTrends = new List<MonthlyAnalyticsDto>();
            for (int i = 5; i >= 0; i--)
            {
                var monthDate = DateTime.UtcNow.AddMonths(-i);
                var monthStart = new DateTime(monthDate.Year, monthDate.Month, 1);
                var monthEnd = monthStart.AddMonths(1).AddTicks(-1);

                var appsInMonth = userApps.Where(a => a.AppliedDate >= monthStart && a.AppliedDate <= monthEnd).ToList();
                int interviewsInMonth = appsInMonth.Sum(a => a.Interviews?.Count(inv => inv.InterviewDate >= monthStart && inv.InterviewDate <= monthEnd) ?? 0);
                int offersInMonth = appsInMonth.Count(a => a.Status == ApplicationStatus.Selected);

                monthlyTrends.Add(new MonthlyAnalyticsDto
                {
                    MonthYear = monthStart.ToString("MMM yyyy"),
                    ApplicationCount = appsInMonth.Count,
                    InterviewCount = interviewsInMonth,
                    OfferCount = offersInMonth
                });
            }

            return new JobAnalyticsDto
            {
                Summary = summary,
                StatusBreakdown = statusBreakdown,
                TopSources = topSources,
                MonthlyTrends = monthlyTrends
            };
        }
    }
}
