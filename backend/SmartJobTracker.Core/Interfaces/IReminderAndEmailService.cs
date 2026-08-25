using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartJobTracker.Core.DTOs;

namespace SmartJobTracker.Core.Interfaces
{
    public interface IReminderService
    {
        Task<IEnumerable<ReminderDto>> GetUserRemindersAsync(Guid userId, bool includePast = false);
        Task<ReminderDto> CreateAsync(Guid userId, CreateReminderDto dto);
        Task<bool> DeleteAsync(Guid userId, Guid reminderId);
        Task ProcessDueRemindersAsync();
    }

    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody);
        Task SendInterviewReminderEmailAsync(string toEmail, string userFullName, string company, string jobTitle, string round, DateTime interviewDate, string? meetingLink);
    }
}
