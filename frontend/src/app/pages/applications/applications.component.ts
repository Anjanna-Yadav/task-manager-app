import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JobApplicationService } from '../../services/job-application.service';
import { ResumeService } from '../../services/resume.service';
import {
  JobApplication,
  ApplicationStatus,
  ApplicationFilterDto,
  CreateApplicationDto,
  Resume
} from '../../models/job-tracker.models';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Job Applications Tracker 📋</h2>
          <p class="subtext">Manage, track, and optimize your application pipeline across all job boards.</p>
        </div>
        <button (click)="openAddModal()" class="btn btn-primary">
          <span>➕</span> Add New Application
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="glass-card toolbar-card">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" class="form-control" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Search company, job title, location...">
        </div>

        <div class="filter-controls">
          <!-- Status Pills -->
          <div class="status-pills">
            <button class="pill-btn" [class.active]="selectedStatus === null" (click)="filterByStatus(null)">All</button>
            <button class="pill-btn" [class.active]="selectedStatus === 'Applied'" (click)="filterByStatus('Applied')">Applied</button>
            <button class="pill-btn" [class.active]="selectedStatus === 'Screening'" (click)="filterByStatus('Screening')">Screening</button>
            <button class="pill-btn" [class.active]="selectedStatus === 'Interview'" (click)="filterByStatus('Interview')">Interview</button>
            <button class="pill-btn" [class.active]="selectedStatus === 'Selected'" (click)="filterByStatus('Selected')">Selected</button>
            <button class="pill-btn" [class.active]="selectedStatus === 'Rejected'" (click)="filterByStatus('Rejected')">Rejected</button>
          </div>

          <!-- Sort Select -->
          <select class="form-select sort-select" [(ngModel)]="sortBy" (change)="applyFilters()">
            <option value="date">Sort by Date Applied</option>
            <option value="salary">Sort by Salary</option>
            <option value="company">Sort by Company</option>
          </select>
        </div>
      </div>

      <!-- Applications Grid -->
      <div class="applications-grid" *ngIf="applications().length > 0; else noApps">
        <div class="app-card glass-card glass-card-interactive" *ngFor="let app of applications()">
          <div class="app-card-header">
            <div class="company-badge">{{ app.company.charAt(0) }}</div>
            <div class="header-info">
              <h3>{{ app.jobTitle }}</h3>
              <div class="company-name">{{ app.company }} • {{ app.location }}</div>
            </div>
            <!-- Status Dropdown -->
            <div class="status-picker">
              <select [ngModel]="app.status" (ngModelChange)="changeStatus(app.id, $event)" class="form-select status-select" [ngClass]="'select-' + app.status">
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div class="app-card-body">
            <div class="meta-row">
              <span class="meta-item" *ngIf="app.salary">💰 \${{ app.salary | number }}</span>
              <span class="meta-item">🌐 Source: {{ app.applicationSource }}</span>
              <span class="meta-item">📅 Applied: {{ app.appliedDate | date:'mediumDate' }}</span>
              <span class="meta-item" *ngIf="app.resumeTitle">📄 Resume: {{ app.resumeTitle }}</span>
            </div>

            <p class="notes-text" *ngIf="app.notes">
              💬 <em>"{{ app.notes }}"</em>
            </p>
          </div>

          <div class="app-card-footer">
            <div class="footer-left">
              <span class="interviews-count" *ngIf="app.totalInterviews > 0">🎙️ {{ app.totalInterviews }} Interview Rounds</span>
              <a *ngIf="app.jobUrl" [href]="app.jobUrl" target="_blank" class="job-link">🔗 Job Posting</a>
            </div>
            <div class="footer-actions">
              <button (click)="openEditModal(app)" class="btn btn-secondary btn-sm">Edit</button>
              <button (click)="deleteApp(app.id)" class="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noApps>
        <div class="glass-card empty-container">
          <div class="empty-icon">🔎</div>
          <h3>No Job Applications Found</h3>
          <p>Start tracking your job search by adding your first application above!</p>
        </div>
      </ng-template>

      <!-- Add/Edit Application Modal -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'Edit Application' : 'Add New Job Application' }}</h3>
            <button (click)="closeModal()" class="icon-btn">✕</button>
          </div>
          <form (ngSubmit)="saveApplication()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Company Name *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.company" name="company" required placeholder="e.g. Microsoft">
              </div>

              <div class="form-group">
                <label class="form-label">Job Title *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.jobTitle" name="jobTitle" required placeholder="e.g. Software Engineer">
              </div>

              <div class="form-group">
                <label class="form-label">Location *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.location" name="location" required placeholder="e.g. Remote / New York, NY">
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label class="form-label">Salary (\$/year)</label>
                  <input type="number" class="form-control" [(ngModel)]="formData.salary" name="salary" placeholder="130000">
                </div>

                <div class="form-group half">
                  <label class="form-label">Application Source</label>
                  <select class="form-select" [(ngModel)]="formData.applicationSource" name="applicationSource">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Company Site">Company Site</option>
                    <option value="Referral">Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label class="form-label">Status</label>
                  <select class="form-select" [(ngModel)]="formData.status" name="status">
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div class="form-group half">
                  <label class="form-label">Attach Resume Version</label>
                  <select class="form-select" [(ngModel)]="formData.resumeId" name="resumeId">
                    <option [ngValue]="null">-- No Resume Selected --</option>
                    <option *ngFor="let r of resumes()" [value]="r.id">{{ r.title }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Job Listing URL</label>
                <input type="url" class="form-control" [(ngModel)]="formData.jobUrl" name="jobUrl" placeholder="https://linkedin.com/jobs/view/...">
              </div>

              <div class="form-group">
                <label class="form-label">Notes & Logs</label>
                <textarea class="form-control" [(ngModel)]="formData.notes" name="notes" rows="3" placeholder="Recruiter contacts, salary expectations, tech stack notes..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Application</button>
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
      margin-bottom: 1.5rem;
    }
    .subtext { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem; }
    .toolbar-card {
      padding: 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .search-box {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
    }
    .search-box input {
      padding-left: 2.75rem;
    }
    .filter-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .status-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .pill-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      padding: 0.4rem 0.9rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pill-btn:hover, .pill-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .sort-select {
      width: auto;
      min-width: 180px;
    }
    .applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }
    .app-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .app-card-header {
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .company-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    .header-info { flex: 1; }
    .header-info h3 { font-size: 1.1rem; line-height: 1.3; }
    .company-name { font-size: 0.85rem; color: var(--text-muted); }
    .status-picker select {
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .select-Applied { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .select-Screening { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .select-Interview { background: rgba(139, 92, 246, 0.2); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.4); }
    .select-Selected { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .select-Rejected { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .notes-text {
      font-size: 0.85rem;
      color: var(--text-dim);
      background: rgba(255,255,255,0.03);
      padding: 0.65rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .app-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    .footer-left { display: flex; flex-direction: column; gap: 0.2rem; }
    .interviews-count { font-size: 0.75rem; color: var(--accent-purple); font-weight: 600; }
    .job-link { font-size: 0.8rem; color: var(--primary); text-decoration: none; }
    .footer-actions { display: flex; gap: 0.5rem; }
    .empty-container { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; }
    .form-row .half { flex: 1; }
  `]
})
export class ApplicationsComponent implements OnInit {
  private applicationService = inject(JobApplicationService);
  private resumeService = inject(ResumeService);
  private route = inject(ActivatedRoute);

  public applications = signal<JobApplication[]>([]);
  public resumes = signal<Resume[]>([]);

  public searchQuery = '';
  public selectedStatus: ApplicationStatus | null = null;
  public sortBy: 'date' | 'salary' | 'company' = 'date';

  public showModal = false;
  public isEditMode = false;
  public editingId: string | null = null;

  public formData: CreateApplicationDto = {
    company: '',
    jobTitle: '',
    location: '',
    salary: undefined,
    jobUrl: '',
    applicationSource: 'LinkedIn',
    appliedDate: new Date().toISOString(),
    status: 'Applied',
    resumeId: undefined,
    notes: ''
  };

  public ngOnInit(): void {
    this.loadApplications();
    this.loadResumes();

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new') {
        this.openAddModal();
      }
    });
  }

  public loadApplications(): void {
    const filter: ApplicationFilterDto = {
      search: this.searchQuery,
      status: this.selectedStatus || undefined,
      sortBy: this.sortBy,
      sortOrder: 'desc'
    };

    this.applicationService.getApplications(filter).subscribe({
      next: (data) => this.applications.set(data),
      error: () => {}
    });
  }

  public loadResumes(): void {
    this.resumeService.getResumes().subscribe({
      next: (data) => this.resumes.set(data),
      error: () => {}
    });
  }

  public filterByStatus(status: ApplicationStatus | null): void {
    this.selectedStatus = status;
    this.loadApplications();
  }

  public applyFilters(): void {
    this.loadApplications();
  }

  public changeStatus(id: string, newStatus: ApplicationStatus): void {
    this.applicationService.updateStatus(id, newStatus).subscribe({
      next: () => this.loadApplications(),
      error: () => {}
    });
  }

  public openAddModal(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.formData = {
      company: '',
      jobTitle: '',
      location: '',
      salary: undefined,
      jobUrl: '',
      applicationSource: 'LinkedIn',
      appliedDate: new Date().toISOString(),
      status: 'Applied',
      resumeId: undefined,
      notes: ''
    };
    this.showModal = true;
  }

  public openEditModal(app: JobApplication): void {
    this.isEditMode = true;
    this.editingId = app.id;
    this.formData = {
      company: app.company,
      jobTitle: app.jobTitle,
      location: app.location,
      salary: app.salary,
      jobUrl: app.jobUrl,
      applicationSource: app.applicationSource,
      appliedDate: app.appliedDate,
      status: app.status,
      resumeId: app.resumeId,
      notes: app.notes
    };
    this.showModal = true;
  }

  public closeModal(): void {
    this.showModal = false;
  }

  public saveApplication(): void {
    if (this.isEditMode && this.editingId) {
      this.applicationService.update(this.editingId, this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadApplications();
        }
      });
    } else {
      this.applicationService.create(this.formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadApplications();
        }
      });
    }
  }

  public deleteApp(id: string): void {
    if (confirm('Are you sure you want to delete this job application?')) {
      this.applicationService.delete(id).subscribe({
        next: () => this.loadApplications()
      });
    }
  }
}
