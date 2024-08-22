import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = 'http://localhost:3001/api/agenda'; // Cambia esto si es necesario

  constructor(private http: HttpClient) {}

  getAgenda(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}