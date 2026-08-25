using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartJobTracker.Core.Entities;

namespace SmartJobTracker.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            try
            {
                // Verify schema validity by attempting to query Reminders table
                await context.Database.EnsureCreatedAsync();
                await context.Reminders.AnyAsync();
            }
            catch
            {
                // If table Reminders does not exist in local database, recreate clean database schema
                await context.Database.EnsureDeletedAsync();
                await context.Database.EnsureCreatedAsync();
            }

            string adminPassHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            string userPassHash = BCrypt.Net.BCrypt.HashPassword("User@123");

            if (await context.Users.AnyAsync())
            {
                // Reset hashes for demo accounts if DB already exists
                var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@jobtracker.com");
                if (existingAdmin != null) existingAdmin.PasswordHash = adminPassHash;

                var existingDemo = await context.Users.FirstOrDefaultAsync(u => u.Email == "user@jobtracker.com");
                if (existingDemo != null) existingDemo.PasswordHash = userPassHash;

                await context.SaveChangesAsync();
                return;
            }

            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@jobtracker.com",
                PasswordHash = adminPassHash,
                FullName = "System Administrator",
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            };

            var demoUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "user@jobtracker.com",
                PasswordHash = userPassHash,
                FullName = "Alex Developer",
                Role = "User",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-3)
            };

            await context.Users.AddRangeAsync(adminUser, demoUser);

            // Sample Resumes for demoUser
            var resume1 = new Resume
            {
                Id = Guid.NewGuid(),
                UserId = demoUser.Id,
                Title = "FullStack .NET & Angular Developer v2.4",
                FilePath = "uploads/resumes/demo_fullstack_resume.pdf",
                OriginalFileName = "Alex_Developer_FullStack_Resume.pdf",
                ContentType = "application/pdf",
                FileSizeBytes = 245800,
                UploadedAt = DateTime.UtcNow.AddMonths(-2)
            };

            var resume2 = new Resume
            {
                Id = Guid.NewGuid(),
                UserId = demoUser.Id,
                Title = "Senior Backend C# Engineer",
                FilePath = "uploads/resumes/demo_backend_resume.pdf",
                OriginalFileName = "Alex_Developer_Backend_C#_Resume.pdf",
                ContentType = "application/pdf",
                FileSizeBytes = 210400,
                UploadedAt = DateTime.UtcNow.AddMonths(-1)
            };

            await context.Resumes.AddRangeAsync(resume1, resume2);

            // Sample Jobs & Applications
            var jobsList = new List<(Job Job, JobApplication App, List<Interview> Interviews)>
            {
                CreateJobWithDetails(demoUser.Id, resume1.Id, "Microsoft", "Senior .NET Software Engineer", "Redmond, WA (Remote)", 145000, "https://careers.microsoft.com/job/123", "LinkedIn", ApplicationStatus.Interview, DateTime.UtcNow.AddDays(-25),
                    new List<(string Round, string Interviewer, string Link, InterviewResult Result, int DaysFromNow)>
                    {
                        ("Recruiter Screening", "Sarah Jenkins", "https://teams.microsoft.com/l/meetup/1", InterviewResult.Passed, -15),
                        ("Technical Deep Dive", "David Chen", "https://teams.microsoft.com/l/meetup/2", InterviewResult.Passed, -7),
                        ("System Design & Architecture", "Marcus Vance", "https://teams.microsoft.com/l/meetup/3", InterviewResult.Scheduled, 2)
                    }),

                CreateJobWithDetails(demoUser.Id, resume1.Id, "Google", "Full Stack Engineer (Angular + Cloud)", "Mountain View, CA (Hybrid)", 160000, "https://careers.google.com/job/456", "Company Site", ApplicationStatus.Selected, DateTime.UtcNow.AddDays(-40),
                    new List<(string Round, string Interviewer, string Link, InterviewResult Result, int DaysFromNow)>
                    {
                        ("HR Initial Chat", "Emily Watson", "https://meet.google.com/abc-defg-hij", InterviewResult.Passed, -30),
                        ("Coding Round (DSA & System Design)", "Arjun Patel", "https://meet.google.com/klm-nopq-rst", InterviewResult.Passed, -20),
                        ("Executive Leadership Round", "Sophia Martinez", "https://meet.google.com/uvw-xyz-123", InterviewResult.Passed, -10)
                    }),

                CreateJobWithDetails(demoUser.Id, resume2.Id, "Amazon Web Services", "Backend C# / Distributed Systems Engineer", "Seattle, WA", 150000, "https://amazon.jobs/en/jobs/789", "Indeed", ApplicationStatus.Screening, DateTime.UtcNow.AddDays(-10),
                    new List<(string Round, string Interviewer, string Link, InterviewResult Result, int DaysFromNow)>
                    {
                        ("Recruiter Phone Screen", "Michael Scott", "Phone Call", InterviewResult.Passed, -3)
                    }),

                CreateJobWithDetails(demoUser.Id, resume1.Id, "Stripe", "Software Engineer - Payments Platform", "San Francisco, CA (Remote)", 155000, "https://stripe.com/jobs/999", "Referral", ApplicationStatus.Applied, DateTime.UtcNow.AddDays(-5),
                    new List<(string Round, string Interviewer, string Link, InterviewResult Result, int DaysFromNow)>()),

                CreateJobWithDetails(demoUser.Id, resume2.Id, "Meta", "Production Engineer", "Menlo Park, CA", 165000, "https://metacareers.com/job/321", "LinkedIn", ApplicationStatus.Rejected, DateTime.UtcNow.AddDays(-50),
                    new List<(string Round, string Interviewer, string Link, InterviewResult Result, int DaysFromNow)>
                    {
                        ("Initial Phone Screen", "Brian Cox", "BlueJeans", InterviewResult.Failed, -40)
                    })
            };

            foreach (var item in jobsList)
            {
                await context.Jobs.AddAsync(item.Job);
                await context.Applications.AddAsync(item.App);
                if (item.Interviews.Any())
                {
                    await context.Interviews.AddRangeAsync(item.Interviews);
                }
            }

            // Reminders
            var upcomingInterview = jobsList[0].Interviews.FirstOrDefault(i => i.Result == InterviewResult.Scheduled);
            if (upcomingInterview != null)
            {
                var reminder1 = new Reminder
                {
                    Id = Guid.NewGuid(),
                    UserId = demoUser.Id,
                    ApplicationId = jobsList[0].App.Id,
                    InterviewId = upcomingInterview.Id,
                    Title = "Prepare for Microsoft System Design Round",
                    Message = "Review distributed caching, microservices, and EF Core performance tuning.",
                    ScheduledDate = DateTime.UtcNow.AddDays(1),
                    IsSent = false,
                    Type = ReminderType.Interview,
                    CreatedAt = DateTime.UtcNow
                };

                var reminder2 = new Reminder
                {
                    Id = Guid.NewGuid(),
                    UserId = demoUser.Id,
                    ApplicationId = jobsList[2].App.Id,
                    Title = "Follow up with AWS recruiter Michael Scott",
                    Message = "Send follow-up thank-you email regarding recruiter phone screen.",
                    ScheduledDate = DateTime.UtcNow.AddDays(3),
                    IsSent = false,
                    Type = ReminderType.FollowUp,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Reminders.AddRangeAsync(reminder1, reminder2);
            }

            await context.SaveChangesAsync();
        }

        private static (Job Job, JobApplication App, List<Interview> Interviews) CreateJobWithDetails(
            Guid userId,
            Guid? resumeId,
            string company,
            string title,
            string location,
            decimal salary,
            string jobUrl,
            string source,
            ApplicationStatus status,
            DateTime appliedDate,
            List<(string Round, string Interviewer, string Link, InterviewResult Result, int DaysFromNow)> interviewDetails)
        {
            var job = new Job
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Company = company,
                JobTitle = title,
                Location = location,
                Salary = salary,
                JobUrl = jobUrl,
                ApplicationSource = source,
                CreatedAt = appliedDate
            };

            var app = new JobApplication
            {
                Id = Guid.NewGuid(),
                JobId = job.Id,
                UserId = userId,
                ResumeId = resumeId,
                AppliedDate = appliedDate,
                Status = status,
                Notes = $"Applied via {source} on {appliedDate:yyyy-MM-dd}.",
                CreatedAt = appliedDate,
                UpdatedAt = DateTime.UtcNow
            };

            var interviews = new List<Interview>();
            foreach (var detail in interviewDetails)
            {
                interviews.Add(new Interview
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    UserId = userId,
                    InterviewDate = DateTime.UtcNow.AddDays(detail.DaysFromNow),
                    Round = detail.Round,
                    Interviewer = detail.Interviewer,
                    MeetingLinkOrLocation = detail.Link,
                    Notes = $"Scheduled with {detail.Interviewer}.",
                    Result = detail.Result,
                    CreatedAt = appliedDate.AddDays(5)
                });
            }

            return (job, app, interviews);
        }
    }
}
