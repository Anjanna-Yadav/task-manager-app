using System;
using System.Collections.Generic;

namespace SmartJobTracker.Core.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "User"; // "Admin" or "User"
        public bool IsActive { get; set; } = true;
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpires { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Job> Jobs { get; set; } = new List<Job>();
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
        public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
        public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
        public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    }
}
