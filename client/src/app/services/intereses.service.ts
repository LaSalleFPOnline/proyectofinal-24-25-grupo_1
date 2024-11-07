import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InteresesService {
  private apiUrl = environment.apiUrl; // URL del servidor Node.js

  constructor(private http: HttpClient) { }

  // Obtener el token de autenticación del sessionStorage
  private getAuthToken(): string {
    return sessionStorage.getItem('authToken') || '';
  }

  // Obtener los encabezados de autenticación
  /*private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });
    
  }*/
  private getAuthHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });

    // Convertir headers a un objeto simple para loguear
    const headersObject: { [key: string]: string | null } = {};
    headers.keys().forEach(key => {
      headersObject[key] = headers.get(key);
    });
    console.log('Headers de autenticación:', headersObject);

    return headers;
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

  // Asegúrate de que esta función acepte los parámetros correctos y devuelva un Observable
  eliminarInteres(params: { empresaId: number; empresaInteresadaId: number }): Observable<any> {
    if (!params.empresaId || !params.empresaInteresadaId) {
      console.error('IDs de las empresas no proporcionados.');
      return throwError(() => new Error('IDs de las empresas no proporcionados.'));
    }
    console.log('Parámetros antes de enviar la solicitud:', params);

    // Usar HttpParams para la solicitud DELETE
    const httpParams = new HttpParams()
      .set('empresaId', params.empresaId.toString())
      .set('empresaInteresadaId', params.empresaInteresadaId.toString());

    return this.http.delete(`${this.apiUrl}/eliminar-interes`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    }).pipe(
      catchError(error => {
        if (error.status) {
          console.error('Código de error HTTP:', error.status);
        }
        console.error('Error en la solicitud de eliminación:', error);
        return throwError(() => new Error('Error en la solicitud de eliminación'));
      })
    );
  }
}