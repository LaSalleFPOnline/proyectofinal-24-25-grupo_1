import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InteresesService {
  private apiUrl = 'http://localhost:3001/api'; // Asegúrate de que esta URL sea la correcta para tu API

  constructor(private http: HttpClient) { }

  // Obtener el token de autenticación del sessionStorage
  private getAuthToken(): string {
    return sessionStorage.getItem('authToken') || '';
  }

  // Obtener los encabezados de autenticación
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });
  }

  crearInteres(empresaId: number, empresaInteresadaId: number): Observable<any> {
    // Verifica que empresaId y empresaInteresadaId no sean undefined o null
    if (!empresaId || !empresaInteresadaId) {
      console.error('IDs de las empresas no proporcionados.');
      return throwError('IDs de las empresas no proporcionados.');
    }

    return this.http.post(`${this.apiUrl}/add-interest`, {
      empresa_id: empresaId,
      empresa_interesada_id: empresaInteresadaId
    }, { headers: this.getAuthHeaders() })
    .pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        return throwError(error);
      })
    );
  }

  obtenerRelaciones(empresaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/relaciones/${empresaId}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error en la solicitud de relaciones:', error);
          return throwError(error);
        })
      );
  }
}
