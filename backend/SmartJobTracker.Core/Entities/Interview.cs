using System;
using System.Collections.Generic;

namespace SmartJobTracker.Core.Entities
{
    public class Interview
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ApplicationId { get; set; }
        public Guid UserId { get; set; }
        public DateTime InterviewDate { get; set; }
        public string Round { get; set; } = "Technical Round 1";
        public string Interviewer { get; set; } = string.Empty;
        public string? MeetingLinkOrLocation { get; set; }
        public string? Notes { get; set; }
        public InterviewResult Result { get; set; } = InterviewResult.Scheduled;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public JobApplication? Application { get; set; }
        public User? User { get; set; }
        public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    }
}
