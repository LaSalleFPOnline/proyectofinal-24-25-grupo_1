import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {  
  private apiUrl = environment.apiUrl; // URL del servidor Node.js

  constructor(private http: HttpClient, private authService: AuthService) { }

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresas`);
  }

  getEmpresaById(id: number): Observable<any> {
    console.log(id); // Verifica que el id esté llegando correctamente
    return this.http.get<any>(`${this.apiUrl}/empresa/${id}`);
  }

  getUsuariosSinPassword(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios-sin-password`);
  }

  /*
  // Llama a esta función para actualizar la empresa usando los datos del servicio AuthService
  actualizarEmpresa(empresa: any): Observable<any> {
    return this.authService.actualizarEmpresa(empresa);
  }*/
}