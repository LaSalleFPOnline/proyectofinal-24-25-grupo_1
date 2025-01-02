import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendaFeriaService {
  private apiUrl = environment.apiUrl; // URL del servidor Node.js


  constructor(private http: HttpClient) {}

  getEventFechasAgendaFeria(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agendaFeria`);
  }
  
}