import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AgendaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAgenda(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agenda`);
  }

  obtenerFechasEdicion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/evento`);
  }

}
