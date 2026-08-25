using System;
using System.ComponentModel.DataAnnotations;
using SmartJobTracker.Core.Entities;

namespace SmartJobTracker.Core.DTOs
{
    public class ResumeDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime UploadedAt { get; set; }
        public int ApplicationsCount { get; set; }
    }

    public class CreateReminderDto
    {
        public Guid? ApplicationId { get; set; }
        public Guid? InterviewId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        [Required]
        public DateTime ScheduledDate { get; set; }

        public ReminderType Type { get; set; } = ReminderType.Interview;
    }

    public class ReminderDto
    {
        public Guid Id { get; set; }
        public Guid? ApplicationId { get; set; }
        public Guid? InterviewId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public bool IsSent { get; set; }
        public ReminderType Type { get; set; }
        public string? Company { get; set; }
        public string? JobTitle { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
