import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAdmin, AdminStats } from '../models/job-tracker.models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5050/api/admin';

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${this.apiUrl}/users`);
  }

  public toggleUserStatus(userId: string, isActive: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/users/${userId}/toggle-status`, isActive, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  public updateUserRole(userId: string, role: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/users/${userId}/role`, JSON.stringify(role), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  public getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }
}
