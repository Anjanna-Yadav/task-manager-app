using System;
using System.Collections.Generic;

namespace SmartJobTracker.Core.Entities
{
    public class Job
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Company { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public decimal? Salary { get; set; }
        public string? JobUrl { get; set; }
        public string ApplicationSource { get; set; } = "LinkedIn"; // LinkedIn, Indeed, Referral, Company Site, etc.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? User { get; set; }
        public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
    }
}
