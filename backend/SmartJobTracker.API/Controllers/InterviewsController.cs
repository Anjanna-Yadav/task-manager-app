using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartJobTracker.Core.DTOs;
using SmartJobTracker.Core.Interfaces;

namespace SmartJobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InterviewsController : ControllerBase
    {
        private readonly IInterviewService _interviewService;

        public InterviewsController(IInterviewService interviewService)
        {
            _interviewService = interviewService;
        }

        private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetUserInterviews()
        {
            var interviews = await _interviewService.GetUserInterviewsAsync(UserId);
            return Ok(interviews);
        }

        [HttpGet("application/{applicationId}")]
        public async Task<IActionResult> GetApplicationInterviews(Guid applicationId)
        {
            var interviews = await _interviewService.GetApplicationInterviewsAsync(UserId, applicationId);
            return Ok(interviews);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var interview = await _interviewService.GetByIdAsync(UserId, id);
            if (interview == null) return NotFound(new { message = "Interview not found." });
            return Ok(interview);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInterviewDto dto)
        {
            try
            {
                var interview = await _interviewService.CreateAsync(UserId, dto);
                return CreatedAtAction(nameof(GetById), new { id = interview.Id }, interview);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateInterviewDto dto)
        {
            var interview = await _interviewService.UpdateAsync(UserId, id, dto);
            if (interview == null) return NotFound(new { message = "Interview not found." });
            return Ok(interview);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _interviewService.DeleteAsync(UserId, id);
            if (!success) return NotFound(new { message = "Interview not found." });
            return NoContent();
        }
    }
}
