using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using SmartJobTracker.Core.DTOs;

namespace SmartJobTracker.Core.Interfaces
{
    public interface IResumeService
    {
        Task<IEnumerable<ResumeDto>> GetUserResumesAsync(Guid userId);
        Task<ResumeDto?> GetByIdAsync(Guid userId, Guid resumeId);
        Task<ResumeDto> UploadResumeAsync(Guid userId, string title, string fileName, string contentType, Stream stream);
        Task<(Stream fileStream, string contentType, string fileName)?> DownloadResumeAsync(Guid userId, Guid resumeId);
        Task<bool> DeleteResumeAsync(Guid userId, Guid resumeId);
    }
}
