using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartJobTracker.Core.Interfaces;

namespace SmartJobTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var summary = await _analyticsService.GetDashboardSummaryAsync(UserId);
            return Ok(summary);
        }

        [HttpGet("detailed")]
        public async Task<IActionResult> GetJobAnalytics()
        {
            var analytics = await _analyticsService.GetJobAnalyticsAsync(UserId);
            return Ok(analytics);
        }
    }
}
