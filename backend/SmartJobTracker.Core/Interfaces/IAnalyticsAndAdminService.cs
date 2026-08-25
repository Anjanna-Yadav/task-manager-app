using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartJobTracker.Core.DTOs;

namespace SmartJobTracker.Core.Interfaces
{
    public interface IAnalyticsService
    {
        Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid userId);
        Task<JobAnalyticsDto> GetJobAnalyticsAsync(Guid userId);
    }

    public interface IAdminService
    {
        Task<IEnumerable<UserAdminDto>> GetAllUsersAsync();
        Task<bool> ToggleUserStatusAsync(Guid userId, bool isActive);
        Task<bool> UpdateUserRoleAsync(Guid userId, string role);
        Task<AdminStatsDto> GetAdminStatsAsync();
    }
}
