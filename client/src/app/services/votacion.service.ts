import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators'; // Asegúrate de importar map
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VotacionService {

  private apiUrl = environment.apiUrl; // URL del servidor Node.js

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Registrar un voto
  votar(usuarioId: number, empresaId: number, voto: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/voto`,
      { id_usuarioVotante: usuarioId, id_empresaVotada: empresaId, voto },
      { headers }
    ).pipe(
      catchError(error => {
        if (error.status === 400 && error.error.message === 'Voto ya registrado') {
          // Personaliza este mensaje según lo que el backend devuelva
          alert('Ya has votado por esta empresa.');
        }
        return throwError(error);
      })
    );
  }

  // Eliminar un voto
  eliminarVoto(usuarioId: number, empresaId: number): Observable<any> {
    const headers = this.getHeaders();
    const body = { id_usuarioVotante: usuarioId, id_empresaVotada: empresaId }; // Cuerpo de la solicitud para DELETE
  
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

  // Verificar si el usuario ha votado por una empresa
  // VotacionService: verificar si un usuario ha votado por una empresa
  verificarVoto(usuarioId: number, empresaId: number): Observable<boolean> {
    const headers = this.getHeaders();
    const params = new HttpParams()
        .set('id_usuarioVotante', usuarioId.toString()) // Asegúrate de que esto coincida con el backend
        .set('id_empresaVotada', empresaId.toString());
    
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/verificar-voto`, { headers, params })
        .pipe(
            map(response => response.existe), // Mapear el resultado a un booleano
            catchError(error => {
                console.error('Error al verificar voto:', error);
                return throwError(error);
            })
        );
  }


  
  // Método para obtener las empresas más votadas SANTI
  obtenerVotos(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/votos`, { headers }).pipe(
        catchError(error => {
            console.error('Error al obtener votos:', error);
            return throwError(error);
        })
    );
  }
}
