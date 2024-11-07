import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {  
  private apiUrl = environment.apiUrl + "/registro"; // URL del servidor Node.js 

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    console.log('Datos que se están enviando:', userData);  // Imprime los datos en la consola

    return this.http.post<any>(this.apiUrl, userData);
  }
}
// Santi