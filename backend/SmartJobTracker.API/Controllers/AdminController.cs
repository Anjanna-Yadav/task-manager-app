using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartJobTracker.Core.Interfaces;

namespace SmartJobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPost("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(Guid userId, [FromBody] bool isActive)
        {
            var success = await _adminService.ToggleUserStatusAsync(userId, isActive);
            if (!success) return NotFound(new { message = "User not found." });
            return Ok(new { message = $"User status updated to {(isActive ? "Active" : "Disabled")}." });
        }

        [HttpPost("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] string role)
        {
            try
            {
                var success = await _adminService.UpdateUserRoleAsync(userId, role);
                if (!success) return NotFound(new { message = "User not found." });
                return Ok(new { message = $"User role updated to '{role}'." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _adminService.GetAdminStatsAsync();
            return Ok(stats);
        }
    }
}
