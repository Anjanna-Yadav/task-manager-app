import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InterviewService } from '../../services/interview.service';
import { JobApplicationService } from '../../services/job-application.service';
import { Interview, JobApplication, CreateInterviewDto, InterviewResult } from '../../models/job-tracker.models';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <div class="page-header">
        <div>
          <h2>Interview Round Manager 📅</h2>
          <p class="subtext">Track interview schedules, interviewer details, meeting links, and results.</p>
        </div>
        <button (click)="openScheduleModal()" class="btn btn-primary">
          <span>➕</span> Schedule Interview
        </button>
      </div>

      <!-- Interviews Timeline / Grid -->
      <div class="interviews-grid" *ngIf="interviews().length > 0; else noInterviews">
        <div class="interview-card glass-card glass-card-interactive" *ngFor="let item of interviews()">
          <div class="int-header">
            <div class="company-logo">{{ item.company.charAt(0) }}</div>
            <div class="int-title-box">
              <h3>{{ item.company }}</h3>
              <span class="job-sub">{{ item.jobTitle }}</span>
            </div>
            <span class="badge-result" [ngClass]="'res-' + item.result">{{ item.result }}</span>
          </div>

          <div class="int-body">
            <div class="round-badge">
              <span>🎯</span> {{ item.round }}
            </div>

            <div class="info-row" *ngIf="item.interviewer">
              <span class="label">Interviewer:</span>
              <span class="val">{{ item.interviewer }}</span>
            </div>

            <div class="info-row">
              <span class="label">Date & Time:</span>
              <span class="val highlight">{{ item.interviewDate | date:'fullDate' }} at {{ item.interviewDate | date:'shortTime' }}</span>
            </div>

            <div class="info-row" *ngIf="item.meetingLinkOrLocation">
              <span class="label">Location / Link:</span>
              <span class="val">
                <a [href]="item.meetingLinkOrLocation" target="_blank" class="link-btn">
                  🔗 {{ item.meetingLinkOrLocation.startsWith('http') ? 'Open Video Call' : item.meetingLinkOrLocation }}
                </a>
              </span>
            </div>

            <p class="notes-box" *ngIf="item.notes">
              📝 {{ item.notes }}
            </p>
          </div>

          <div class="int-footer">
            <div class="result-actions">
              <span class="quick-label">Result:</span>
              <button class="btn btn-sm" [class.btn-primary]="item.result === 'Passed'" (click)="updateResult(item, 'Passed')">Passed</button>
              <button class="btn btn-sm" [class.btn-danger]="item.result === 'Failed'" (click)="updateResult(item, 'Failed')">Failed</button>
            </div>
            <button (click)="deleteInterview(item.id)" class="btn btn-secondary btn-sm">Delete</button>
          </div>
        </div>
      </div>

      <ng-template #noInterviews>
        <div class="glass-card empty-container">
          <div class="empty-icon">☕</div>
          <h3>No Interviews Scheduled Yet</h3>
          <p>Schedule your first interview round to keep track of questions and follow-ups!</p>
        </div>
      </ng-template>

      <!-- Schedule Modal -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Schedule Interview Round</h3>
            <button (click)="closeModal()" class="icon-btn">✕</button>
          </div>

          <form (ngSubmit)="saveInterview()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Select Job Application *</label>
                <select class="form-select" [(ngModel)]="formData.applicationId" name="applicationId" required>
                  <option value="">-- Choose Application --</option>
                  <option *ngFor="let app of applications()" [value]="app.id">
                    {{ app.company }} - {{ app.jobTitle }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Interview Round *</label>
                <select class="form-select" [(ngModel)]="formData.round" name="round">
                  <option value="Recruiter Screening">Recruiter Screening</option>
                  <option value="Technical Round 1">Technical Round 1</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Behavioral & HR Round">Behavioral & HR Round</option>
                  <option value="Executive Leadership">Executive Leadership</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Interviewer Name(s)</label>
                <input type="text" class="form-control" [(ngModel)]="formData.interviewer" name="interviewer" placeholder="e.g. Sarah Jenkins (Senior Director)">
              </div>

              <div class="form-group">
                <label class="form-label">Date & Time *</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="formData.interviewDate" name="interviewDate" required>
              </div>

              <div class="form-group">
                <label class="form-label">Meeting Link or Location</label>
                <input type="text" class="form-control" [(ngModel)]="formData.meetingLinkOrLocation" name="meetingLinkOrLocation" placeholder="https://teams.microsoft.com/...">
              </div>

              <div class="form-group">
                <label class="form-label">Preparation Notes</label>
                <textarea class="form-control" [(ngModel)]="formData.notes" name="notes" rows="3" placeholder="Topics to cover, company research, questions to ask interviewer..."></textarea>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.setFollowUpReminder" name="setFollowUpReminder">
                  Automatically set an email reminder 2 hours prior 🔔
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!formData.applicationId">Save Interview</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .subtext { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem; }
    .interviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }
    .interview-card { padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; }
    .int-header { display: flex; gap: 0.85rem; align-items: center; margin-bottom: 1rem; }
    .company-logo {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--accent-purple) 0%, var(--primary) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 700;
      color: white;
    }
    .int-title-box { flex: 1; }
    .int-title-box h3 { font-size: 1.1rem; }
    .job-sub { font-size: 0.8rem; color: var(--text-muted); }
    .badge-result {
      padding: 0.3rem 0.65rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .res-Scheduled { background: rgba(139, 92, 246, 0.2); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }
    .res-Passed { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .res-Failed { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
    .round-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.06);
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.85rem;
    }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.85rem; }
    .info-row .label { color: var(--text-muted); }
    .info-row .val.highlight { color: var(--accent-amber); font-weight: 600; }
    .link-btn { color: var(--primary); text-decoration: none; }
    .notes-box {
      font-size: 0.85rem;
      color: var(--text-dim);
      background: rgba(255,255,255,0.03);
      padding: 0.65rem;
      border-radius: 8px;
      margin-top: 0.75rem;
    }
    .int-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    .result-actions { display: flex; align-items: center; gap: 0.4rem; }
    .quick-label { font-size: 0.75rem; color: var(--text-muted); }
    .empty-container { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .checkbox-group { display: flex; align-items: center; }
    .checkbox-label { font-size: 0.85rem; color: var(--text-muted); cursor: pointer; display: flex; gap: 0.5rem; align-items: center; }
  `]
})
export class InterviewsComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private applicationService = inject(JobApplicationService);
  private route = inject(ActivatedRoute);

  public interviews = signal<Interview[]>([]);
  public applications = signal<JobApplication[]>([]);

  public showModal = false;
  public formData: CreateInterviewDto = {
    applicationId: '',
    interviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    round: 'Technical Round 1',
    interviewer: '',
    meetingLinkOrLocation: '',
    notes: '',
    result: 'Scheduled',
    setFollowUpReminder: true
  };

  public ngOnInit(): void {
    this.loadInterviews();
    this.loadApplications();

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        this.openScheduleModal();
      }
    });
  }

  public loadInterviews(): void {
    this.interviewService.getUserInterviews().subscribe({
      next: (data) => this.interviews.set(data),
      error: () => {}
    });
  }

  public loadApplications(): void {
    this.applicationService.getApplications({ pageSize: 100 }).subscribe({
      next: (apps) => this.applications.set(apps),
      error: () => {}
    });
  }

  public openScheduleModal(): void {
    this.formData = {
      applicationId: this.applications().length > 0 ? this.applications()[0].id : '',
      interviewDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      round: 'Technical Round 1',
      interviewer: '',
      meetingLinkOrLocation: '',
      notes: '',
      result: 'Scheduled',
      setFollowUpReminder: true
    };
    this.showModal = true;
  }

  public closeModal(): void {
    this.showModal = false;
  }

  public saveInterview(): void {
    this.interviewService.create(this.formData).subscribe({
      next: () => {
        this.closeModal();
        this.loadInterviews();
      }
    });
  }

  public updateResult(item: Interview, result: InterviewResult): void {
    this.interviewService.update(item.id, {
      interviewDate: item.interviewDate,
      round: item.round,
      interviewer: item.interviewer,
      meetingLinkOrLocation: item.meetingLinkOrLocation,
      notes: item.notes,
      result: result
    }).subscribe({
      next: () => this.loadInterviews()
    });
  }

  public deleteInterview(id: string): void {
    if (confirm('Are you sure you want to delete this interview record?')) {
      this.interviewService.delete(id).subscribe({
        next: () => this.loadInterviews()
      });
    }
  }
}
