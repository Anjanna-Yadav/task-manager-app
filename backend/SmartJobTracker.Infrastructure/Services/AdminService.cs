using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartJobTracker.Core.DTOs;
using SmartJobTracker.Core.Interfaces;
using SmartJobTracker.Infrastructure.Data;

namespace SmartJobTracker.Infrastructure.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserAdminDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Applications)
                .Include(u => u.Interviews)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(u => new UserAdminDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                ApplicationsCount = u.Applications?.Count ?? 0,
                InterviewsCount = u.Interviews?.Count ?? 0
            });
        }

        public async Task<bool> ToggleUserStatusAsync(Guid userId, bool isActive)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateUserRoleAsync(Guid userId, string role)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            if (role != "Admin" && role != "User")
            {
                throw new ArgumentException("Invalid role name. Must be 'Admin' or 'User'.");
            }

            user.Role = role;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AdminStatsDto> GetAdminStatsAsync()
        {
            int totalUsers = await _context.Users.CountAsync();
            int activeUsers = await _context.Users.CountAsync(u => u.IsActive);
            int totalApps = await _context.Applications.CountAsync();
            int totalInterviews = await _context.Interviews.CountAsync();
            int totalResumes = await _context.Resumes.CountAsync();

            return new AdminStatsDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                TotalApplicationsSystemWide = totalApps,
                TotalInterviewsSystemWide = totalInterviews,
                TotalResumesSystemWide = totalResumes
            };
        }
    }
}
