using System;
using System.ComponentModel.DataAnnotations;
using SmartJobTracker.Core.Entities;

namespace SmartJobTracker.Core.DTOs
{
    public class CreateInterviewDto
    {
        [Required]
        public Guid ApplicationId { get; set; }

        [Required]
        public DateTime InterviewDate { get; set; }

        [Required]
        public string Round { get; set; } = "Technical Round 1";

        public string Interviewer { get; set; } = string.Empty;
        public string? MeetingLinkOrLocation { get; set; }
        public string? Notes { get; set; }
        public InterviewResult Result { get; set; } = InterviewResult.Scheduled;
        public bool SetFollowUpReminder { get; set; } = true;
    }

    public class UpdateInterviewDto
    {
        [Required]
        public DateTime InterviewDate { get; set; }

        [Required]
        public string Round { get; set; } = string.Empty;

        public string Interviewer { get; set; } = string.Empty;
        public string? MeetingLinkOrLocation { get; set; }
        public string? Notes { get; set; }
        public InterviewResult Result { get; set; }
    }

    public class InterviewDto
    {
        public Guid Id { get; set; }
        public Guid ApplicationId { get; set; }
        public string Company { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public DateTime InterviewDate { get; set; }
        public string Round { get; set; } = string.Empty;
        public string Interviewer { get; set; } = string.Empty;
        public string? MeetingLinkOrLocation { get; set; }
        public string? Notes { get; set; }
        public InterviewResult Result { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
