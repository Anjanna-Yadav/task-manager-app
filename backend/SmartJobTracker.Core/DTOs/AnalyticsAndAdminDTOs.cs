using System;
using System.Collections.Generic;

namespace SmartJobTracker.Core.DTOs
{
    public class DashboardSummaryDto
    {
        public int TotalApplications { get; set; }
        public int TotalInterviews { get; set; }
        public int TotalSelected { get; set; }
        public int TotalRejected { get; set; }
        public int ApplicationsThisMonth { get; set; }
        public int InterviewsUpcoming { get; set; }
        public double InterviewConversionRate { get; set; } // Percentage
        public double SelectionRate { get; set; } // Percentage
        public double AverageDaysToInterview { get; set; } // Velocity
    }

    public class SourceAnalyticsDto
    {
        public string Source { get; set; } = string.Empty;
        public int ApplicationCount { get; set; }
        public int InterviewCount { get; set; }
        public int SelectedCount { get; set; }
        public double SuccessRate { get; set; } // Percentage selected/applied
    }

    public class MonthlyAnalyticsDto
    {
        public string MonthYear { get; set; } = string.Empty; // "Jan 2026", "Feb 2026"
        public int ApplicationCount { get; set; }
        public int InterviewCount { get; set; }
        public int OfferCount { get; set; }
    }

    public class JobAnalyticsDto
    {
        public DashboardSummaryDto Summary { get; set; } = new DashboardSummaryDto();
        public List<SourceAnalyticsDto> TopSources { get; set; } = new List<SourceAnalyticsDto>();
        public List<MonthlyAnalyticsDto> MonthlyTrends { get; set; } = new List<MonthlyAnalyticsDto>();
        public Dictionary<string, int> StatusBreakdown { get; set; } = new Dictionary<string, int>();
    }

    public class UserAdminDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ApplicationsCount { get; set; }
        public int InterviewsCount { get; set; }
    }

    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalApplicationsSystemWide { get; set; }
        public int TotalInterviewsSystemWide { get; set; }
        public int TotalResumesSystemWide { get; set; }
    }
}
