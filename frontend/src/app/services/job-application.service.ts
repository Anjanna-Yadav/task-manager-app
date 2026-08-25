import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JobApplication,
  CreateApplicationDto,
  ApplicationFilterDto,
  ApplicationStatus
} from '../models/job-tracker.models';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private apiUrl = 'http://localhost:5050/api/applications';

  constructor(private http: HttpClient) {}

  public getApplications(filter: ApplicationFilterDto): Observable<JobApplication[]> {
    let params = new HttpParams();
    if (filter.search) params = params.set('search', filter.search);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.source) params = params.set('source', filter.source);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<JobApplication[]>(this.apiUrl, { params });
  }

  public getById(id: string): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  public create(dto: CreateApplicationDto): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, dto);
  }

  public update(id: string, dto: CreateApplicationDto): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.apiUrl}/${id}`, dto);
  }

  public updateStatus(id: string, status: ApplicationStatus): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
