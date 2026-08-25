import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReminderService } from '../../services/reminder.service';
import { Reminder } from '../../models/job-tracker.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-header">
      <div class="nav-container">
        <!-- Logo -->
        <a routerLink="/" class="nav-brand">
          <div class="brand-icon">💼</div>
          <div class="brand-text">Smart<span class="gradient-text">Tracker</span></div>
        </a>

        <!-- Logged-in Links -->
        <nav class="nav-links" *ngIf="authService.isLoggedIn()">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span>📊</span> Dashboard
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="nav-item">
            <span>📋</span> Applications
          </a>
          <a routerLink="/interviews" routerLinkActive="active" class="nav-item">
            <span>📅</span> Interviews
          </a>
          <a routerLink="/resumes" routerLinkActive="active" class="nav-item">
            <span>📄</span> Resumes
          </a>
          <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
            <span>📈</span> Analytics
          </a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" routerLinkActive="active" class="nav-item admin-link">
            <span>🛡️</span> Admin Panel
          </a>
        </nav>

        <!-- Right Side Actions -->
        <div class="nav-actions">
          <!-- Notification Bell -->
          <div class="notifications-wrapper" *ngIf="authService.isLoggedIn()">
            <button class="icon-btn" (click)="toggleNotifications()" title="Upcoming Reminders">
              🔔
              <span class="badge-count" *ngIf="reminders().length > 0">{{ reminders().length }}</span>
            </button>

            <!-- Notifications Drawer Dropdown -->
            <div class="notifications-dropdown glass-card" *ngIf="showNotifications()">
              <div class="notifications-header">
                <h3>Upcoming Reminders</h3>
                <span class="count">{{ reminders().length }} pending</span>
              </div>
              <div class="notifications-list" *ngIf="reminders().length > 0; else noReminders">
                <div class="notification-item" *ngFor="let r of reminders()">
                  <div class="notif-icon" [ngClass]="r.type">
                    {{ r.type === 'Interview' ? '📅' : '⏰' }}
                  </div>
                  <div class="notif-content">
                    <div class="notif-title">{{ r.title }}</div>
                    <div class="notif-sub" *ngIf="r.company">{{ r.company }} • {{ r.jobTitle }}</div>
                    <div class="notif-time">{{ r.scheduledDate | date:'short' }}</div>
                  </div>
                </div>
              </div>
              <ng-template #noReminders>
                <div class="empty-notif">No upcoming reminders</div>
              </ng-template>
            </div>
          </div>

          <!-- User Menu or Login Buttons -->
          <div class="user-menu" *ngIf="authService.isLoggedIn(); else authButtons">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-info">
              <span class="user-name">{{ authService.currentUser()?.fullName }}</span>
              <span class="user-role">{{ authService.currentUser()?.role }}</span>
            </div>
            <button (click)="logout()" class="btn btn-secondary btn-sm" title="Log Out">
              🚪 Sign Out
            </button>
          </div>

          <ng-template #authButtons>
            <div class="auth-group">
              <a routerLink="/login" class="btn btn-secondary btn-sm">Log In</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Register</a>
            </div>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-header {
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 900;
    }
    .nav-container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    .nav-item:hover, .nav-item.active {
      color: #fff;
      background: rgba(255, 255, 255, 0.07);
    }
    .nav-item.active {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .admin-link {
      color: var(--accent-amber);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .icon-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      font-size: 1.1rem;
    }
    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--accent-rose);
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .notifications-wrapper {
      position: relative;
    }
    .notifications-dropdown {
      position: absolute;
      right: 0;
      top: 48px;
      width: 320px;
      padding: 1rem;
      z-index: 1000;
    }
    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .notifications-header h3 {
      font-size: 0.9rem;
    }
    .notifications-header .count {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .notification-item {
      display: flex;
      gap: 0.65rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .notif-title { font-size: 0.85rem; font-weight: 600; }
    .notif-sub { font-size: 0.75rem; color: var(--text-muted); }
    .notif-time { font-size: 0.7rem; color: var(--primary); margin-top: 0.2rem; }
    .empty-notif { text-align: center; color: var(--text-dim); padding: 1rem; font-size: 0.85rem; }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%);
      color: white;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name { font-size: 0.85rem; font-weight: 600; }
    .user-role { font-size: 0.7rem; color: var(--accent-teal); text-transform: uppercase; }
    .auth-group { display: flex; gap: 0.5rem; }
  `]
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  private reminderService = inject(ReminderService);
  private router = inject(Router);

  public showNotifications = signal(false);
  public reminders = signal<Reminder[]>([]);

  public ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadReminders();
    }
  }

  public loadReminders(): void {
    this.reminderService.getReminders().subscribe({
      next: (data) => this.reminders.set(data),
      error: () => {}
    });
  }

  public toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
  }

  public userInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
