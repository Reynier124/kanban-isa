import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface Project {
  id?: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, { headers: this.headers() });
  }

  create(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, { headers: this.headers() });
  }

  update(project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${project.id}`, project, { headers: this.headers() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
  
}
