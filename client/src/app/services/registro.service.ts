import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl + "/registro";

  constructor(private http: HttpClient) {}

  register(userData: FormData): Observable<any> {
    console.log('Datos que se están enviando:', userData);
    return this.http.post<any>(`${this.apiUrl}/registro`, userData);
  }

}