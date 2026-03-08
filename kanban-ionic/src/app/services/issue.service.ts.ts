import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';

export interface Issue {
  id?: number;
  title: string;
  description?: string;
  status?: IssueStatus;
  user?: { id: number; login: string };
  project?: { id: number; name: string };
}

@Injectable({
  providedIn: 'root',
})
export class IssueServiceTs {

  private apiUrl = `${environment.apiUrl}/api/issues`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getAll(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.apiUrl, { headers: this.headers() });
  }

  create(issue: Issue): Observable<Issue> {
    return this.http.post<Issue>(this.apiUrl, issue, { headers: this.headers() });
  }

  update(issue: Issue): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${issue.id}`, issue, { headers: this.headers() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
  
}
