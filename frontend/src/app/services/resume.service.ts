import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resume } from '../models/job-tracker.models';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private apiUrl = 'http://localhost:5050/api/resumes';

  constructor(private http: HttpClient) {}

  public getResumes(): Observable<Resume[]> {
    return this.http.get<Resume[]>(this.apiUrl);
  }

  public uploadResume(file: File, title: string): Observable<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    return this.http.post<Resume>(`${this.apiUrl}/upload`, formData);
  }

  public downloadResume(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  public deleteResume(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
