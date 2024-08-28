import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private apiUrl = 'http://localhost:3001/api/'; // URL del servidor Node.js

  constructor(private http: HttpClient, private authService: AuthService) { }

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresas`);
  }

  getEmpresaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/empresa/${id}`);
  }

  /*
  // Llama a esta función para actualizar la empresa usando los datos del servicio AuthService
  actualizarEmpresa(empresa: any): Observable<any> {
    return this.authService.actualizarEmpresa(empresa);
  }*/
}