namespace SmartJobTracker.Core.Entities
{
    public enum ApplicationStatus
    {
        Applied,
        Screening,
        Interview,
        Selected,
        Rejected
    }

    public enum InterviewResult
    {
        Scheduled,
        Passed,
        Failed,
        Pending
    }

    public enum ReminderType
    {
        Interview,
        FollowUp,
        Custom
    }
}
