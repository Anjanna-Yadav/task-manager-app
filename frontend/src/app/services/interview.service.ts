import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interview, CreateInterviewDto } from '../models/job-tracker.models';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:5050/api/interviews';

  constructor(private http: HttpClient) {}

  public getUserInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.apiUrl);
  }

  public getApplicationInterviews(applicationId: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/application/${applicationId}`);
  }

  public create(dto: CreateInterviewDto): Observable<Interview> {
    return this.http.post<Interview>(this.apiUrl, dto);
  }

  public update(id: string, dto: Partial<CreateInterviewDto>): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}`, dto);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
