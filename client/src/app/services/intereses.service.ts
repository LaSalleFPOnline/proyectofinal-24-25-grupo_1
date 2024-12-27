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
  crearInteres(id_empresaVendedora: number, id_empresaCompradora: number): Observable<any> {
    // Verifica que empresaId y empresaInteresadaId no sean undefined o null
    if (!id_empresaVendedora || !id_empresaCompradora) {
      console.error('IDs de las empresas no proporcionados.');
      return throwError('IDs de las empresas no proporcionados.');
    }

    const payload = { id_empresaVendedora, id_empresaCompradora };
    return this.http.post(`${this.apiUrl}/add-interest`, payload, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error en la creación de interés:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerRelaciones(id_empresaVendedora: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/relaciones/${id_empresaVendedora}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error en la solicitud de relaciones:', error);
          return throwError(error);
        })
      );
  }

  // Asegúrate de que esta función acepte los parámetros correctos y devuelva un Observable
  eliminarInteres(params: { id_empresaVendedora: number; id_empresaCompradora: number }): Observable<any> {
    if (!params.id_empresaVendedora || !params.id_empresaCompradora) {
      console.error('IDs de las empresas no proporcionados.');
      return throwError(() => new Error('IDs de las empresas no proporcionados.'));
    }
    console.log('Parámetros antes de enviar la solicitud:', params);

    // Usar HttpParams para la solicitud DELETE
    const httpParams = new HttpParams()
      .set('empresaId', params.id_empresaVendedora.toString())
      .set('empresaInteresadaId', params.id_empresaCompradora.toString());

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