import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="auth-badge">Account Recovery</div>
          <h2>Forgot <span class="gradient-text">Password?</span></h2>
          <p>Enter your registered email address to receive password reset instructions.</p>
        </div>

        <form (ngSubmit)="onRequestReset()" #forgotForm="ngForm" *ngIf="!submitted">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" required placeholder="user@jobtracker.com">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || !forgotForm.valid">
            <span *ngIf="loading">Sending Request...</span>
            <span *ngIf="!loading">Send Reset Instructions ✉️</span>
          </button>
        </form>

        <div class="success-box" *ngIf="submitted">
          <div class="success-icon">✅</div>
          <h3>Request Processed</h3>
          <p>If your email is registered in Smart Tracker, password reset instructions have been dispatched.</p>
          <a routerLink="/login" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Back to Login</a>
        </div>

        <div class="auth-footer" *ngIf="!submitted">
          Remember your password? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 75px); display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
    .auth-card { width: 100%; max-width: 440px; padding: 2.25rem; }
    .auth-header { text-align: center; margin-bottom: 1.75rem; }
    .auth-badge { display: inline-block; padding: 0.25rem 0.75rem; background: rgba(99, 102, 241, 0.15); color: var(--primary); border-radius: 20px; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.75rem; }
    .auth-header h2 { font-size: 1.6rem; margin-bottom: 0.4rem; }
    .auth-header p { color: var(--text-muted); font-size: 0.875rem; }
    .btn-block { width: 100%; margin-top: 0.5rem; }
    .success-box { text-align: center; padding: 1.5rem 0; }
    .success-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  public email = '';
  public loading = false;
  public submitted = false;

  public onRequestReset(): void {
    this.loading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
      },
      error: () => {
        this.loading = false;
        this.submitted = true;
      }
    });
  }
}
