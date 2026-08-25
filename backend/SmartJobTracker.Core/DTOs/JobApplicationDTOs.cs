using System;
using System.ComponentModel.DataAnnotations;
using SmartJobTracker.Core.Entities;

namespace SmartJobTracker.Core.DTOs
{
    public class JobDto
    {
        public Guid Id { get; set; }
        public string Company { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public string? JobUrl { get; set; }
        public string ApplicationSource { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateApplicationDto
    {
        [Required]
        public string Company { get; set; } = string.Empty;

        [Required]
        public string JobTitle { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        public decimal? Salary { get; set; }
        public string? JobUrl { get; set; }
        public string ApplicationSource { get; set; } = "LinkedIn";

        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
        public Guid? ResumeId { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateApplicationDto
    {
        [Required]
        public string Company { get; set; } = string.Empty;

        [Required]
        public string JobTitle { get; set; } = string.Empty;

        [Required]
        public string Location { get; set; } = string.Empty;

        public decimal? Salary { get; set; }
        public string? JobUrl { get; set; }
        public string ApplicationSource { get; set; } = "LinkedIn";

        public DateTime AppliedDate { get; set; }
        public ApplicationStatus Status { get; set; }
        public Guid? ResumeId { get; set; }
        public string? Notes { get; set; }
    }

    public class JobApplicationDto
    {
        public Guid Id { get; set; }
        public Guid JobId { get; set; }
        public Guid UserId { get; set; }
        public string Company { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public string? JobUrl { get; set; }
        public string ApplicationSource { get; set; } = string.Empty;
        public DateTime AppliedDate { get; set; }
        public ApplicationStatus Status { get; set; }
        public Guid? ResumeId { get; set; }
        public string? ResumeTitle { get; set; }
        public string? Notes { get; set; }
        public int TotalInterviews { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApplicationFilterDto
    {
        public string? Search { get; set; }
        public ApplicationStatus? Status { get; set; }
        public string? Source { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? SortBy { get; set; } // "date", "salary", "company"
        public string? SortOrder { get; set; } // "asc", "desc"
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
