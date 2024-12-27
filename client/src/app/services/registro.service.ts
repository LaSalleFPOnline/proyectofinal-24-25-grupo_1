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

 // register(userData: any): Observable<any> {
     // Imprime los datos en la consola
    register(userData: FormData): Observable<any> {
      console.log('Datos que se están enviando:', userData);
      return this.http.post<any>(`${this.apiUrl}/registro`, userData);
    }
    //return this.http.post<any>(this.apiUrl, userData);
 // }
}
// Santi