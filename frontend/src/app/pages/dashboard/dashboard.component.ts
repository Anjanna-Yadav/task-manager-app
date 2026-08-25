import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { JobApplicationService } from '../../services/job-application.service';
import { InterviewService } from '../../services/interview.service';
import { DashboardSummary, JobApplication, Interview } from '../../models/job-tracker.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <!-- Header Banner -->
      <div class="dashboard-header glass-card">
        <div class="header-text">
          <h1>Welcome Back, <span class="gradient-text">{{ userName() }}</span> 👋</h1>
          <p>Here is your job application pipeline overview and interview schedule for today.</p>
        </div>
        <div class="quick-actions">
          <a routerLink="/applications" [queryParams]="{ action: 'new' }" class="btn btn-primary">
            <span>➕</span> Add Application
          </a>
          <a routerLink="/interviews" [queryParams]="{ action: 'new' }" class="btn btn-secondary">
            <span>📅</span> Schedule Interview
          </a>
        </div>
      </div>

      <!-- KPI Summary Cards Grid -->
      <div class="kpi-grid">
        <div class="kpi-card glass-card glass-card-interactive">
          <div class="kpi-icon blue">📋</div>
          <div class="kpi-info">
            <span class="kpi-label">Total Applications</span>
            <span class="kpi-value">{{ summary()?.totalApplications || 0 }}</span>
            <span class="kpi-sub">{{ summary()?.applicationsThisMonth || 0 }} applied this month</span>
          </div>
        </div>

        <div class="kpi-card glass-card glass-card-interactive">
          <div class="kpi-icon purple">🎙️</div>
          <div class="kpi-info">
            <span class="kpi-label">Total Interviews</span>
            <span class="kpi-value">{{ summary()?.totalInterviews || 0 }}</span>
            <span class="kpi-sub">{{ summary()?.interviewsUpcoming || 0 }} upcoming scheduled</span>
          </div>
        </div>

        <div class="kpi-card glass-card glass-card-interactive">
          <div class="kpi-icon emerald">🏆</div>
          <div class="kpi-info">
            <span class="kpi-label">Offers & Selected</span>
            <span class="kpi-value">{{ summary()?.totalSelected || 0 }}</span>
            <span class="kpi-sub">{{ summary()?.selectionRate || 0 }}% offer rate</span>
          </div>
        </div>

        <div class="kpi-card glass-card glass-card-interactive">
          <div class="kpi-icon teal">⚡</div>
          <div class="kpi-info">
            <span class="kpi-label">Interview Conversion</span>
            <span class="kpi-value">{{ summary()?.interviewConversionRate || 0 }}%</span>
            <span class="kpi-sub">Avg {{ summary()?.averageDaysToInterview || 0 }} days to interview</span>
          </div>
        </div>
      </div>

      <!-- Content Grid: Upcoming Interviews & Recent Applications -->
      <div class="dashboard-grid">
        <!-- Upcoming Interviews Widget -->
        <div class="glass-card widget-card">
          <div class="widget-header">
            <h3>📅 Upcoming Interviews</h3>
            <a routerLink="/interviews" class="view-all">View All →</a>
          </div>

          <div class="interviews-list" *ngIf="upcomingInterviews().length > 0; else noInterviews">
            <div class="interview-item" *ngFor="let item of upcomingInterviews()">
              <div class="int-date-box">
                <span class="day">{{ item.interviewDate | date:'dd' }}</span>
                <span class="month">{{ item.interviewDate | date:'MMM' }}</span>
              </div>
              <div class="int-details">
                <div class="int-company">{{ item.company }}</div>
                <div class="int-round">{{ item.round }} • {{ item.interviewer }}</div>
                <div class="int-link" *ngIf="item.meetingLinkOrLocation">
                  🔗 <a [href]="item.meetingLinkOrLocation" target="_blank">Meeting Link</a>
                </div>
              </div>
              <span class="badge-status badge-Interview">Scheduled</span>
            </div>
          </div>
          <ng-template #noInterviews>
            <div class="empty-state">
              <div class="empty-icon">☕</div>
              <p>No upcoming interviews scheduled for this week.</p>
            </div>
          </ng-template>
        </div>

        <!-- Recent Job Applications Widget -->
        <div class="glass-card widget-card">
          <div class="widget-header">
            <h3>📋 Recent Applications</h3>
            <a routerLink="/applications" class="view-all">View All →</a>
          </div>

          <div class="apps-list" *ngIf="recentApps().length > 0; else noApps">
            <div class="app-item" *ngFor="let app of recentApps()">
              <div class="app-info">
                <div class="app-title">{{ app.jobTitle }}</div>
                <div class="app-company">{{ app.company }} • {{ app.location }}</div>
              </div>
              <div class="app-meta">
                <span class="badge-status" [ngClass]="'badge-' + app.status">{{ app.status }}</span>
                <span class="app-date">{{ app.appliedDate | date:'shortDate' }}</span>
              </div>
            </div>
          </div>
          <ng-template #noApps>
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <p>No job applications tracked yet.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      padding: 2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .header-text h1 { font-size: 1.8rem; margin-bottom: 0.3rem; }
    .header-text p { color: var(--text-muted); font-size: 0.95rem; }
    .quick-actions { display: flex; gap: 0.75rem; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .kpi-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .kpi-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .kpi-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .kpi-icon.purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
    .kpi-icon.emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .kpi-icon.teal { background: rgba(20, 184, 166, 0.15); color: #14b8a6; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
    .kpi-value { font-size: 1.8rem; font-weight: 700; color: var(--text-main); line-height: 1.2; }
    .kpi-sub { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.25rem; }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .widget-card { padding: 1.5rem; }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .view-all { font-size: 0.85rem; color: var(--primary); text-decoration: none; font-weight: 600; }
    .interviews-list, .apps-list { display: flex; flex-direction: column; gap: 1rem; }
    .interview-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      border: 1px solid var(--border-subtle);
    }
    .int-date-box {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      padding: 0.5rem 0.75rem;
      border-radius: 10px;
      text-align: center;
      color: white;
      min-width: 52px;
    }
    .int-date-box .day { display: block; font-size: 1.2rem; font-weight: 700; line-height: 1; }
    .int-date-box .month { font-size: 0.7rem; text-transform: uppercase; }
    .int-details { flex: 1; }
    .int-company { font-weight: 600; font-size: 0.95rem; }
    .int-round { font-size: 0.8rem; color: var(--text-muted); }
    .int-link a { font-size: 0.75rem; color: var(--primary); }
    .app-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      border: 1px solid var(--border-subtle);
    }
    .app-title { font-weight: 600; font-size: 0.95rem; }
    .app-company { font-size: 0.8rem; color: var(--text-muted); }
    .app-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; }
    .app-date { font-size: 0.75rem; color: var(--text-dim); }
    .empty-state { text-align: center; padding: 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 2rem; margin-bottom: 0.5rem; }
  `]
})
export class DashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private applicationService = inject(JobApplicationService);
  private interviewService = inject(InterviewService);

  public summary = signal<DashboardSummary | null>(null);
  public recentApps = signal<JobApplication[]>([]);
  public upcomingInterviews = signal<Interview[]>([]);
  public userName = signal<string>('Developer');

  public ngOnInit(): void {
    const raw = localStorage.getItem('job_tracker_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        this.userName.set(u.fullName || 'Developer');
      } catch {}
    }

    this.loadData();
  }

  private loadData(): void {
    this.analyticsService.getDashboardSummary().subscribe({
      next: (data: DashboardSummary) => this.summary.set(data),
      error: () => {}
    });

    this.applicationService.getApplications({ page: 1, pageSize: 5 }).subscribe({
      next: (apps: JobApplication[]) => this.recentApps.set(apps),
      error: () => {}
    });

    this.interviewService.getUserInterviews().subscribe({
      next: (interviews: Interview[]) => {
        const upcoming = interviews.filter(i => i.result === 'Scheduled').slice(0, 5);
        this.upcomingInterviews.set(upcoming);
      },
      error: () => {}
    });
  }
}
