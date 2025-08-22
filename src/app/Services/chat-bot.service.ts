import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private baseUrl = 'http://localhost:3000';   // JSON server base

  constructor(private http: HttpClient) {}

  getServiceFlow(serviceName: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${serviceName}`).pipe(
      map(res => (Array.isArray(res) ? res[0] : res)) // JSON server returns array → pick first object
    );
  }
}
