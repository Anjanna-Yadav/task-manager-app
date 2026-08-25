export type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'Selected' | 'Rejected';
export type InterviewResult = 'Scheduled' | 'Passed' | 'Failed' | 'Pending';
export type ReminderType = 'Interview' | 'FollowUp' | 'Custom';

export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User';
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User';
  userId: string;
  expiresAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  company: string;
  jobTitle: string;
  location: string;
  salary?: number;
  jobUrl?: string;
  applicationSource: string;
  appliedDate: string;
  status: ApplicationStatus;
  resumeId?: string;
  resumeTitle?: string;
  notes?: string;
  totalInterviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  company: string;
  jobTitle: string;
  location: string;
  salary?: number;
  jobUrl?: string;
  applicationSource: string;
  appliedDate: string;
  status: ApplicationStatus;
  resumeId?: string;
  notes?: string;
}

export interface ApplicationFilterDto {
  search?: string;
  status?: ApplicationStatus;
  source?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'date' | 'salary' | 'company' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface Interview {
  id: string;
  applicationId: string;
  company: string;
  jobTitle: string;
  interviewDate: string;
  round: string;
  interviewer: string;
  meetingLinkOrLocation?: string;
  notes?: string;
  result: InterviewResult;
  createdAt: string;
}

export interface CreateInterviewDto {
  applicationId: string;
  interviewDate: string;
  round: string;
  interviewer: string;
  meetingLinkOrLocation?: string;
  notes?: string;
  result: InterviewResult;
  setFollowUpReminder: boolean;
}

export interface Resume {
  id: string;
  title: string;
  originalFileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  applicationsCount: number;
}

export interface Reminder {
  id: string;
  applicationId?: string;
  interviewId?: string;
  title: string;
  message: string;
  scheduledDate: string;
  isSent: boolean;
  type: ReminderType;
  company?: string;
  jobTitle?: string;
  createdAt: string;
}

export interface CreateReminderDto {
  applicationId?: string;
  interviewId?: string;
  title: string;
  message: string;
  scheduledDate: string;
  type: ReminderType;
}

export interface DashboardSummary {
  totalApplications: number;
  totalInterviews: number;
  totalSelected: number;
  totalRejected: number;
  applicationsThisMonth: number;
  interviewsUpcoming: number;
  interviewConversionRate: number;
  selectionRate: number;
  averageDaysToInterview: number;
}

export interface SourceAnalytics {
  source: string;
  applicationCount: number;
  interviewCount: number;
  selectedCount: number;
  successRate: number;
}

export interface MonthlyAnalytics {
  monthYear: string;
  applicationCount: number;
  interviewCount: number;
  offerCount: number;
}

export interface JobAnalytics {
  summary: DashboardSummary;
  statusBreakdown: Record<string, number>;
  topSources: SourceAnalytics[];
  monthlyTrends: MonthlyAnalytics[];
}

export interface UserAdmin {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  applicationsCount: number;
  interviewsCount: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalApplicationsSystemWide: number;
  totalInterviewsSystemWide: number;
  totalResumesSystemWide: number;
}
