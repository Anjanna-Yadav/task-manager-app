import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reminder, CreateReminderDto } from '../models/job-tracker.models';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private apiUrl = 'http://localhost:5050/api/reminders';

  constructor(private http: HttpClient) {}

  public getReminders(includePast = false): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}?includePast=${includePast}`);
  }

  public create(dto: CreateReminderDto): Observable<Reminder> {
    return this.http.post<Reminder>(this.apiUrl, dto);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
