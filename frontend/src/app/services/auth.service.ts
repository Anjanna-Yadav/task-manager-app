import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/job-tracker.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5050/api/auth';

  public currentUser = signal<User | null>(this.getStoredUser());
  public isLoggedIn = computed(() => !!this.currentUser());
  public isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor(private http: HttpClient) {}

  public register(data: { email: string; password: string; fullName: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  public login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  public forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  public resetPassword(data: { email: string; token: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, data);
  }

  public logout(): void {
    localStorage.removeItem('job_tracker_user');
    this.currentUser.set(null);
  }

  public getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  private handleAuthSuccess(res: AuthResponse): void {
    const user: User = {
      userId: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      token: res.token,
      expiresAt: res.expiresAt
    };
    localStorage.setItem('job_tracker_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('job_tracker_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
