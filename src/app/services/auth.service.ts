
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3001/api'; // URL del servidor Node.js
  private tokenKey = 'authToken';
  private user: any = null;
  private empresa: any = null;
  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }
  // Método para guardar el token en localStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Método para obtener el token desde localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Método para borrar el token de localStorage
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  actualizarEmpresa(empresa: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-empresa`, empresa);
  }
    // Método para verificar los datos de una empresa
   /* verificarDatosEmpresa(data: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/verificar-datos-empresa`, data);
    }*/
  setUser(user: any) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  setEmpresa(empresa: any) {
    this.empresa = empresa;
  }

  getEmpresa() {
    return this.empresa;
  }

}

// src/app/services/auth.service.ts

/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3001'; // URL del servidor Node.js

  constructor(private http: HttpClient) { }

  /*register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password });
  }*/
   /* register(email: string, password: string): Observable<any> {
      const user = { email, password };
      return this.http.post(`${this.apiUrl}/register`, user);
    }
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }
}*/