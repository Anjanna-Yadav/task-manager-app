import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <div class="auth-badge">Welcome Back</div>
          <h2>Sign in to <span class="gradient-text">Smart Tracker</span></h2>
          <p>Track job applications, interview rounds, and career metrics in one place.</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" required placeholder="user@jobtracker.com">
          </div>

          <div class="form-group">
            <div class="flex-between">
              <label class="form-label">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot Password?</a>
            </div>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" required placeholder="••••••••">
          </div>

          <div class="error-alert" *ngIf="errorMessage">
            ⚠️ {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading || !loginForm.valid">
            <span *ngIf="loading">Signing in...</span>
            <span *ngIf="!loading">Sign In 🚀</span>
          </button>
        </form>

        <div class="demo-section">
          <div class="demo-divider"><span>OR QUICK DEMO LOGIN</span></div>
          <div class="demo-buttons">
            <button class="btn btn-secondary btn-sm" (click)="fillDemoUser()">
              👤 Demo User (User&#64;123)
            </button>
            <button class="btn btn-secondary btn-sm" (click)="fillAdminUser()">
              🛡️ Admin User (Admin&#64;123)
            </button>
          </div>
        </div>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Register now</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 75px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.25rem;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .auth-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(99, 102, 241, 0.15);
      color: var(--primary);
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .auth-header h2 { font-size: 1.6rem; margin-bottom: 0.4rem; }
    .auth-header p { color: var(--text-muted); font-size: 0.875rem; }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    .forgot-link { font-size: 0.8rem; color: var(--primary); text-decoration: none; }
    .btn-block { width: 100%; margin-top: 0.5rem; }
    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.65rem;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .demo-section { margin-top: 1.5rem; text-align: center; }
    .demo-divider {
      position: relative;
      text-align: center;
      margin-bottom: 1rem;
    }
    .demo-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      background: var(--border-subtle);
    }
    .demo-divider span {
      position: relative;
      background: #0b0f19;
      padding: 0 0.75rem;
      font-size: 0.7rem;
      color: var(--text-dim);
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .demo-buttons { display: flex; gap: 0.5rem; justify-content: center; }
    .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public email = '';
  public password = '';
  public loading = false;
  public errorMessage = '';

  public onLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check credentials.';
      }
    });
  }

  public fillDemoUser(): void {
    this.email = 'user@jobtracker.com';
    this.password = 'User@123';
    this.onLogin();
  }

  public fillAdminUser(): void {
    this.email = 'admin@jobtracker.com';
    this.password = 'Admin@123';
    this.onLogin();
  }
}
