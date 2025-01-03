import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class EmpresaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresas`);
  }

  getEmpresaById(id: number): Observable<any> {
    console.log(id);
    return this.http.get<any>(`${this.apiUrl}/empresa/${id}`);
  }

  getUsuariosSinPassword(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios-sin-password`);
  }

}