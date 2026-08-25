using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartJobTracker.Core.Interfaces;

namespace SmartJobTracker.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            _logger.LogInformation("================ EMAIL SENT ================");
            _logger.LogInformation("TO: {ToEmail}", toEmail);
            _logger.LogInformation("SUBJECT: {Subject}", subject);
            _logger.LogInformation("BODY:\n{Body}", htmlBody);
            _logger.LogInformation("============================================");

            return Task.CompletedTask;
        }

        public Task SendInterviewReminderEmailAsync(string toEmail, string userFullName, string company, string jobTitle, string round, DateTime interviewDate, string? meetingLink)
        {
            string htmlBody = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #2563eb;'>Smart Job Tracker - Upcoming Interview Alert 🔔</h2>
                    <p>Hello <strong>{userFullName}</strong>,</p>
                    <p>This is a reminder for your upcoming interview round:</p>
                    <table style='border-collapse: collapse; width: 100%; max-width: 500px; margin: 15px 0;'>
                        <tr style='background: #f1f5f9;'><td style='padding: 8px; font-weight: bold;'>Company:</td><td style='padding: 8px;'>{company}</td></tr>
                        <tr><td style='padding: 8px; font-weight: bold;'>Position:</td><td style='padding: 8px;'>{jobTitle}</td></tr>
                        <tr style='background: #f1f5f9;'><td style='padding: 8px; font-weight: bold;'>Round:</td><td style='padding: 8px;'>{round}</td></tr>
                        <tr><td style='padding: 8px; font-weight: bold;'>Date & Time:</td><td style='padding: 8px;'>{interviewDate:F}</td></tr>
                        {(string.IsNullOrWhiteSpace(meetingLink) ? "" : $"<tr style='background: #f1f5f9;'><td style='padding: 8px; font-weight: bold;'>Meeting Link:</td><td style='padding: 8px;'><a href='{meetingLink}'>{meetingLink}</a></td></tr>")}
                    </table>
                    <p>Best of luck with your preparation!</p>
                </div>";

            return SendEmailAsync(toEmail, $"Interview Alert: {company} ({round})", htmlBody);
        }
    }
}
