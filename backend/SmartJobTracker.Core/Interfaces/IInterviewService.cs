using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartJobTracker.Core.DTOs;

namespace SmartJobTracker.Core.Interfaces
{
    public interface IInterviewService
    {
        Task<IEnumerable<InterviewDto>> GetUserInterviewsAsync(Guid userId);
        Task<IEnumerable<InterviewDto>> GetApplicationInterviewsAsync(Guid userId, Guid applicationId);
        Task<InterviewDto?> GetByIdAsync(Guid userId, Guid interviewId);
        Task<InterviewDto> CreateAsync(Guid userId, CreateInterviewDto dto);
        Task<InterviewDto?> UpdateAsync(Guid userId, Guid interviewId, UpdateInterviewDto dto);
        Task<bool> DeleteAsync(Guid userId, Guid interviewId);
    }
}
