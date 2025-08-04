import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceFlowService {
  constructor(private http:HttpClient){}

serviceFlow(serviceName: string): Observable<any> {
  return this.http.get<any[]>(`http://localhost:3000/serviceFlow?serviceName=${serviceName}`);
}


}