using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartJobTracker.Core.DTOs;
using SmartJobTracker.Core.Entities;
using SmartJobTracker.Core.Interfaces;
using SmartJobTracker.Infrastructure.Data;

namespace SmartJobTracker.Infrastructure.Services
{
    public class ResumeService : IResumeService
    {
        private readonly AppDbContext _context;
        private readonly string _uploadFolder;

        public ResumeService(AppDbContext context)
        {
            _context = context;
            _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "resumes");
            if (!Directory.Exists(_uploadFolder))
            {
                Directory.CreateDirectory(_uploadFolder);
            }
        }

        public async Task<IEnumerable<ResumeDto>> GetUserResumesAsync(Guid userId)
        {
            var resumes = await _context.Resumes
                .Include(r => r.Applications)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.UploadedAt)
                .ToListAsync();

            return resumes.Select(r => new ResumeDto
            {
                Id = r.Id,
                Title = r.Title,
                OriginalFileName = r.OriginalFileName,
                ContentType = r.ContentType,
                FileSizeBytes = r.FileSizeBytes,
                UploadedAt = r.UploadedAt,
                ApplicationsCount = r.Applications?.Count ?? 0
            });
        }

        public async Task<ResumeDto?> GetByIdAsync(Guid userId, Guid resumeId)
        {
            var r = await _context.Resumes
                .Include(r => r.Applications)
                .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userId);

            if (r == null) return null;

            return new ResumeDto
            {
                Id = r.Id,
                Title = r.Title,
                OriginalFileName = r.OriginalFileName,
                ContentType = r.ContentType,
                FileSizeBytes = r.FileSizeBytes,
                UploadedAt = r.UploadedAt,
                ApplicationsCount = r.Applications?.Count ?? 0
            };
        }

        public async Task<ResumeDto> UploadResumeAsync(Guid userId, string title, string fileName, string contentType, Stream stream)
        {
            string fileExt = Path.GetExtension(fileName);
            string uniqueFileName = $"{userId}_{Guid.NewGuid():N}{fileExt}";
            string destinationPath = Path.Combine(_uploadFolder, uniqueFileName);

            using (var fileStream = new FileStream(destinationPath, FileMode.Create))
            {
                await stream.CopyToAsync(fileStream);
            }

            var resume = new Resume
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = string.IsNullOrWhiteSpace(title) ? fileName : title,
                FilePath = destinationPath,
                OriginalFileName = fileName,
                ContentType = contentType,
                FileSizeBytes = stream.Length,
                UploadedAt = DateTime.UtcNow
            };

            await _context.Resumes.AddAsync(resume);
            await _context.SaveChangesAsync();

            return new ResumeDto
            {
                Id = resume.Id,
                Title = resume.Title,
                OriginalFileName = resume.OriginalFileName,
                ContentType = resume.ContentType,
                FileSizeBytes = resume.FileSizeBytes,
                UploadedAt = resume.UploadedAt,
                ApplicationsCount = 0
            };
        }

        public async Task<(Stream fileStream, string contentType, string fileName)?> DownloadResumeAsync(Guid userId, Guid resumeId)
        {
            var resume = await _context.Resumes.FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userId);
            if (resume == null || !File.Exists(resume.FilePath)) return null;

            var memory = new MemoryStream();
            using (var stream = new FileStream(resume.FilePath, FileMode.Open, FileAccess.Read))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return (memory, resume.ContentType, resume.OriginalFileName);
        }

        public async Task<bool> DeleteResumeAsync(Guid userId, Guid resumeId)
        {
            var resume = await _context.Resumes.FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userId);
            if (resume == null) return false;

            if (File.Exists(resume.FilePath))
            {
                try { File.Delete(resume.FilePath); } catch { }
            }

            _context.Resumes.Remove(resume);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
