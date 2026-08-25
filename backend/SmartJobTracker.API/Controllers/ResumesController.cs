using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartJobTracker.Core.Interfaces;

namespace SmartJobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResumesController : ControllerBase
    {
        private readonly IResumeService _resumeService;

        public ResumesController(IResumeService resumeService)
        {
            _resumeService = resumeService;
        }

        private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetResumes()
        {
            var resumes = await _resumeService.GetUserResumesAsync(UserId);
            return Ok(resumes);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string? title)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            using (var stream = file.OpenReadStream())
            {
                var resume = await _resumeService.UploadResumeAsync(
                    UserId,
                    title ?? file.FileName,
                    file.FileName,
                    file.ContentType,
                    stream);

                return Ok(resume);
            }
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> Download(Guid id)
        {
            var result = await _resumeService.DownloadResumeAsync(UserId, id);
            if (result == null) return NotFound(new { message = "Resume file not found." });

            return File(result.Value.fileStream, result.Value.contentType, result.Value.fileName);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _resumeService.DeleteResumeAsync(UserId, id);
            if (!success) return NotFound(new { message = "Resume not found." });
            return NoContent();
        }
    }
}
