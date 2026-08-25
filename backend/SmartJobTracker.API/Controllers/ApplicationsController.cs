using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartJobTracker.Core.DTOs;
using SmartJobTracker.Core.Entities;
using SmartJobTracker.Core.Interfaces;

namespace SmartJobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly IJobApplicationService _applicationService;

        public ApplicationsController(IJobApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetApplications([FromQuery] ApplicationFilterDto filter)
        {
            var apps = await _applicationService.GetApplicationsAsync(UserId, filter);
            return Ok(apps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var app = await _applicationService.GetByIdAsync(UserId, id);
            if (app == null) return NotFound(new { message = "Application not found." });
            return Ok(app);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateApplicationDto dto)
        {
            var app = await _applicationService.CreateAsync(UserId, dto);
            return CreatedAtAction(nameof(GetById), new { id = app.Id }, app);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateApplicationDto dto)
        {
            var app = await _applicationService.UpdateAsync(UserId, id, dto);
            if (app == null) return NotFound(new { message = "Application not found." });
            return Ok(app);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] ApplicationStatus status)
        {
            var success = await _applicationService.UpdateStatusAsync(UserId, id, status);
            if (!success) return NotFound(new { message = "Application not found." });
            return Ok(new { message = "Status updated successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _applicationService.DeleteAsync(UserId, id);
            if (!success) return NotFound(new { message = "Application not found." });
            return NoContent();
        }
    }
}
