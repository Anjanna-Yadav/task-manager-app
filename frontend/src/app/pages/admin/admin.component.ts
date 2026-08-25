import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { UserAdmin, AdminStats } from '../../models/job-tracker.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <div class="page-header">
        <div>
          <h2>System Administration Panel 🛡️</h2>
          <p class="subtext">Manage user accounts, system authorization roles, and platform metrics.</p>
        </div>
      </div>

      <!-- Admin Stats KPIs -->
      <div class="admin-kpi-grid" *ngIf="stats()">
        <div class="kpi-card glass-card">
          <div class="kpi-icon blue">👥</div>
          <div>
            <span class="kpi-label">Registered Users</span>
            <span class="kpi-val">{{ stats()?.totalUsers }} Users</span>
            <span class="kpi-sub">{{ stats()?.activeUsers }} Active</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon purple">📋</div>
          <div>
            <span class="kpi-label">Platform Applications</span>
            <span class="kpi-val">{{ stats()?.totalApplicationsSystemWide }}</span>
            <span class="kpi-sub">Tracked across system</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon teal">🎙️</div>
          <div>
            <span class="kpi-label">Platform Interviews</span>
            <span class="kpi-val">{{ stats()?.totalInterviewsSystemWide }}</span>
            <span class="kpi-sub">Rounds conducted</span>
          </div>
        </div>

        <div class="kpi-card glass-card">
          <div class="kpi-icon amber">📄</div>
          <div>
            <span class="kpi-label">Resumes Stored</span>
            <span class="kpi-val">{{ stats()?.totalResumesSystemWide }}</span>
            <span class="kpi-sub">Multi-version files</span>
          </div>
        </div>
      </div>

      <!-- User Management Table -->
      <div class="glass-card table-card">
        <div class="table-header">
          <h3>User Accounts & Role Management</h3>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Interviews</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users()">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ getInitials(u.fullName) }}</div>
                    <div>
                      <div class="user-name">{{ u.fullName }}</div>
                      <div class="user-email">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-badge" [class.admin]="u.role === 'Admin'">{{ u.role }}</span>
                </td>
                <td>
                  <span class="status-indicator" [class.active]="u.isActive" [class.disabled]="!u.isActive">
                    {{ u.isActive ? '● Active' : '○ Disabled' }}
                  </span>
                </td>
                <td>{{ u.applicationsCount }}</td>
                <td>{{ u.interviewsCount }}</td>
                <td>{{ u.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm" [class.btn-danger]="u.isActive" [class.btn-primary]="!u.isActive" (click)="toggleStatus(u)">
                      {{ u.isActive ? 'Disable' : 'Enable' }}
                    </button>
                    <button class="btn btn-secondary btn-sm" (click)="toggleRole(u)">
                      Set as {{ u.role === 'Admin' ? 'User' : 'Admin' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .subtext { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem; }
    .admin-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .kpi-card { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
    .kpi-icon.blue { background: rgba(59,130,246,0.15); color: #3b82f6; }
    .kpi-icon.purple { background: rgba(139,92,246,0.15); color: #8b5cf6; }
    .kpi-icon.teal { background: rgba(20,184,166,0.15); color: #14b8a6; }
    .kpi-icon.amber { background: rgba(245,158,11,0.15); color: #f59e0b; }
    .kpi-label { font-size: 0.8rem; color: var(--text-muted); display: block; }
    .kpi-val { font-size: 1.5rem; font-weight: 700; display: block; }
    .kpi-sub { font-size: 0.75rem; color: var(--text-dim); }
    .table-card { padding: 1.5rem; }
    .table-header { margin-bottom: 1.25rem; }
    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    .admin-table th { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
    .admin-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%); color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; }
    .user-name { font-weight: 600; }
    .user-email { font-size: 0.8rem; color: var(--text-muted); }
    .role-badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: rgba(255,255,255,0.08); color: var(--text-muted); }
    .role-badge.admin { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
    .status-indicator { font-weight: 600; font-size: 0.85rem; }
    .status-indicator.active { color: #34d399; }
    .status-indicator.disabled { color: #fca5a5; }
    .action-buttons { display: flex; gap: 0.5rem; }
  `]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);

  public users = signal<UserAdmin[]>([]);
  public stats = signal<AdminStats | null>(null);

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.adminService.getUsers().subscribe({
      next: (data: UserAdmin[]) => this.users.set(data),
      error: (err: any) => console.error('Error fetching users:', err)
    });

    this.adminService.getStats().subscribe({
      next: (data: AdminStats) => this.stats.set(data),
      error: (err: any) => console.error('Error fetching admin stats:', err)
    });
  }

  public getInitials(name: string): string {
    return (name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  public toggleStatus(user: UserAdmin): void {
    const newStatus = !user.isActive;
    this.adminService.toggleUserStatus(user.id, newStatus).subscribe({
      next: () => this.loadData(),
      error: (err: any) => console.error('Error toggling status:', err)
    });
  }

  public toggleRole(user: UserAdmin): void {
    const newRole = user.role === 'Admin' ? 'User' : 'Admin';
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => this.loadData(),
      error: (err: any) => console.error('Error toggling role:', err)
    });
  }
}

