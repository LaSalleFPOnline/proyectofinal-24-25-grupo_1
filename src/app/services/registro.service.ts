import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://tu-api.com/registro';  // URL de tu API

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    console.log('Datos que se están enviando:', userData);  // Imprime los datos en la consola

    return this.http.post<any>(this.apiUrl, userData);
  }
}
// Santi