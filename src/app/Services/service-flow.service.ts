import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceFlowService {
  constructor(private http:HttpClient){}
apiUrl='https://localhost:5000/';

serviceFlow(apiUrl:string,serviceName:string){
  this.http.get(apiUrl)
}
}
