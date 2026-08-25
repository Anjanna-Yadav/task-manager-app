using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartJobTracker.Core.DTOs;
using SmartJobTracker.Core.Entities;

namespace SmartJobTracker.Core.Interfaces
{
    public interface IJobApplicationService
    {
        Task<IEnumerable<JobApplicationDto>> GetApplicationsAsync(Guid userId, ApplicationFilterDto filter);
        Task<JobApplicationDto?> GetByIdAsync(Guid userId, Guid applicationId);
        Task<JobApplicationDto> CreateAsync(Guid userId, CreateApplicationDto dto);
        Task<JobApplicationDto?> UpdateAsync(Guid userId, Guid applicationId, UpdateApplicationDto dto);
        Task<bool> UpdateStatusAsync(Guid userId, Guid applicationId, ApplicationStatus status);
        Task<bool> DeleteAsync(Guid userId, Guid applicationId);
    }
}
