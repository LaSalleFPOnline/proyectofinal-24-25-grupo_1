import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VotacionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  votar(usuarioId: number, empresaId: number, voto: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/voto`,
      { id_usuarioVotante: usuarioId, id_empresaVotada: empresaId, voto },
      { headers }
    ).pipe(
      catchError(error => {
        if (error.status === 400 && error.error.message === 'Voto ya registrado') {
          alert('Ya has votado por esta empresa.');
        }
        return throwError(error);
      })
    );
  }

  eliminarVoto(usuarioId: number, empresaId: number): Observable<any> {
    const headers = this.getHeaders();
    const body = { id_usuarioVotante: usuarioId, id_empresaVotada: empresaId };
    return this.http.request('DELETE', `${this.apiUrl}/voto`, {
      body,
      headers
    }).pipe(
      catchError(error => {
        console.error('Error al eliminar voto:', error);
        return throwError(error);
      })
    );
  }

  verificarVoto(usuarioId: number, empresaId: number): Observable<boolean> {
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('id_usuarioVotante', usuarioId.toString())
      .set('id_empresaVotada', empresaId.toString());
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/verificar-voto`, { headers, params })
    .pipe(
      map(response => response.existe),
      catchError(error => {
        console.error('Error al verificar voto:', error);
        return throwError(error);
      })
    );
  }

  obtenerVotos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/votos`).pipe(
      catchError(error => {
        console.error('Error al obtener votos:', error);
        return throwError(error);
      })
    );
  }

  obtenerFechasVotacion(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/evento`).pipe(
      catchError(error => {
        console.error('Error al obtener fechas de votación:', error);
        return throwError(error);
      })
    );
  }

}
