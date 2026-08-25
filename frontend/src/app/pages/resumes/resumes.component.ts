import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumeService } from '../../services/resume.service';
import { Resume } from '../../models/job-tracker.models';

@Component({
  selector: 'app-resumes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-container">
      <div class="page-header">
        <div>
          <h2>Resume Versions Manager 📄</h2>
          <p class="subtext">Upload and manage customized resume versions for different job roles and tech stacks.</p>
        </div>
        <button (click)="openUploadModal()" class="btn btn-primary">
          <span>📤</span> Upload New Resume
        </button>
      </div>

      <!-- Resumes List Grid -->
      <div class="resumes-grid" *ngIf="resumes().length > 0; else noResumes">
        <div class="resume-card glass-card glass-card-interactive" *ngFor="let item of resumes()">
          <div class="resume-header">
            <div class="file-icon">PDF</div>
            <div class="resume-title-box">
              <h3>{{ item.title }}</h3>
              <span class="file-sub">{{ item.originalFileName }}</span>
            </div>
          </div>

          <div class="resume-meta">
            <div class="meta-item">
              <span class="label">Uploaded:</span>
              <span class="val">{{ item.uploadedAt | date:'mediumDate' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">File Size:</span>
              <span class="val">{{ (item.fileSizeBytes / 1024) | number:'1.0-1' }} KB</span>
            </div>
            <div class="meta-item">
              <span class="label">Applications Linked:</span>
              <span class="val badge-count-link">{{ item.applicationsCount }} Applications</span>
            </div>
          </div>

          <div class="resume-footer">
            <button (click)="downloadResume(item)" class="btn btn-primary btn-sm">
              <span>⬇️</span> Download File
            </button>
            <button (click)="deleteResume(item.id)" class="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>

      <ng-template #noResumes>
        <div class="glass-card empty-container">
          <div class="empty-icon">📁</div>
          <h3>No Resume Versions Uploaded</h3>
          <p>Upload customized resume PDFs to link them with specific job applications.</p>
        </div>
      </ng-template>

      <!-- Upload Modal -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Upload Resume Version</h3>
            <button (click)="closeModal()" class="icon-btn">✕</button>
          </div>

          <form (ngSubmit)="uploadFile()">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Resume Title / Version Tag *</label>
                <input type="text" class="form-control" [(ngModel)]="resumeTitle" name="title" required placeholder="e.g. Senior FullStack .NET Resume v2">
              </div>

              <div class="form-group">
                <label class="form-label">Select File (.pdf, .docx) *</label>
                <input type="file" class="form-control" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx" required>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!selectedFile || !resumeTitle">Upload Resume</button>
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
    .resumes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }
    .resume-card { padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; }
    .resume-header { display: flex; gap: 0.85rem; align-items: center; margin-bottom: 1.25rem; }
    .file-icon {
      width: 46px;
      height: 46px;
      background: linear-gradient(135deg, var(--accent-rose) 0%, var(--accent-amber) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 800;
      color: white;
    }
    .resume-title-box h3 { font-size: 1.05rem; }
    .file-sub { font-size: 0.8rem; color: var(--text-muted); }
    .resume-meta { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 1.25rem; }
    .meta-item { display: flex; justify-content: space-between; }
    .meta-item .label { color: var(--text-muted); }
    .badge-count-link { color: var(--accent-teal); font-weight: 600; }
    .resume-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    .empty-container { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  `]
})
export class ResumesComponent implements OnInit {
  private resumeService = inject(ResumeService);

  public resumes = signal<Resume[]>([]);
  public showModal = false;
  public resumeTitle = '';
  public selectedFile: File | null = null;

  public ngOnInit(): void {
    this.loadResumes();
  }

  public loadResumes(): void {
    this.resumeService.getResumes().subscribe({
      next: (data: Resume[]) => this.resumes.set(data),
      error: () => {}
    });
  }

  public openUploadModal(): void {
    this.resumeTitle = '';
    this.selectedFile = null;
    this.showModal = true;
  }

  public closeModal(): void {
    this.showModal = false;
  }

  public onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      if (!this.resumeTitle) {
        this.resumeTitle = this.selectedFile.name.replace(/\.[^/.]+$/, '');
      }
    }
  }

  public uploadFile(): void {
    if (!this.selectedFile) return;
    this.resumeService.uploadResume(this.selectedFile, this.resumeTitle).subscribe({
      next: () => {
        this.closeModal();
        this.loadResumes();
      }
    });
  }

  public downloadResume(item: Resume): void {
    this.resumeService.downloadResume(item.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.originalFileName;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  public deleteResume(id: string): void {
    if (confirm('Are you sure you want to delete this resume version?')) {
      this.resumeService.deleteResume(id).subscribe({
        next: () => this.loadResumes()
      });
    }
  }
}
