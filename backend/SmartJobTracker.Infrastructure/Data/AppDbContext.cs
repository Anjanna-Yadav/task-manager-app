using Microsoft.EntityFrameworkCore;
using SmartJobTracker.Core.Entities;

namespace SmartJobTracker.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Job> Jobs { get; set; } = null!;
        public DbSet<JobApplication> Applications { get; set; } = null!;
        public DbSet<Interview> Interviews { get; set; } = null!;
        public DbSet<Resume> Resumes { get; set; } = null!;
        public DbSet<Reminder> Reminders { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
            });

            // Job configuration
            modelBuilder.Entity<Job>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Company).IsRequired().HasMaxLength(150);
                entity.Property(e => e.JobTitle).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Salary).HasColumnType("decimal(18,2)");
                entity.Property(e => e.ApplicationSource).HasMaxLength(100);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Jobs)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Application configuration
            modelBuilder.Entity<JobApplication>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Status).HasConversion<string>();

                entity.HasOne(e => e.Job)
                      .WithMany(j => j.Applications)
                      .HasForeignKey(e => e.JobId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Applications)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Resume)
                      .WithMany(r => r.Applications)
                      .HasForeignKey(e => e.ResumeId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Interview configuration
            modelBuilder.Entity<Interview>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Round).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Result).HasConversion<string>();

                entity.HasOne(e => e.Application)
                      .WithMany(a => a.Interviews)
                      .HasForeignKey(e => e.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Interviews)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            // Resume configuration
            modelBuilder.Entity<Resume>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Resumes)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Reminder configuration
            modelBuilder.Entity<Reminder>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).HasConversion<string>();

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Reminders)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Application)
                      .WithMany(a => a.Reminders)
                      .HasForeignKey(e => e.ApplicationId)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Interview)
                      .WithMany(i => i.Reminders)
                      .HasForeignKey(e => e.InterviewId)
                      .OnDelete(DeleteBehavior.NoAction);
            });
        }
    }
}
