using System;
using System.Collections.Generic;

namespace SmartJobTracker.Core.Entities
{
    public class JobApplication
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid JobId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ResumeId { get; set; }
        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Job? Job { get; set; }
        public User? User { get; set; }
        public Resume? Resume { get; set; }
        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
        public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    }
}
