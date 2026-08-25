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
    public class RemindersController : ControllerBase
    {
        private readonly IReminderService _reminderService;

        public RemindersController(IReminderService reminderService)
        {
            _reminderService = reminderService;
        }

        private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetReminders([FromQuery] bool includePast = false)
        {
            var reminders = await _reminderService.GetUserRemindersAsync(UserId, includePast);
            return Ok(reminders);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReminderDto dto)
        {
            var reminder = await _reminderService.CreateAsync(UserId, dto);
            return Ok(reminder);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _reminderService.DeleteAsync(UserId, id);
            if (!success) return NotFound(new { message = "Reminder not found." });
            return NoContent();
        }
    }
}
