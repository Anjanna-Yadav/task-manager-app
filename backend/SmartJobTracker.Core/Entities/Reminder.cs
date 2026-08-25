using System;

namespace SmartJobTracker.Core.Entities
{
    public class Reminder
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid? ApplicationId { get; set; }
        public Guid? InterviewId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public bool IsSent { get; set; } = false;
        public ReminderType Type { get; set; } = ReminderType.Interview;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
        public JobApplication? Application { get; set; }
        public Interview? Interview { get; set; }
    }
}
