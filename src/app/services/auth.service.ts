import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importar map desde rxjs/operators

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3001/api'; // URL del servidor Node.js
  private tokenKey = 'authToken';
  private userSubject = new BehaviorSubject<any>(null);
  private empresaSubject = new BehaviorSubject<any>(null);
  private roleSubject = new BehaviorSubject<number | null>(null);

  constructor(private http: HttpClient) {
    // Inicializa el estado del usuario y el rol si hay un token en localStorage
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Asumir que el token se ha verificado y que se puede obtener el usuario y el rol
      this.userSubject.next(JSON.parse(localStorage.getItem('user') || '{}'));
      this.roleSubject.next(parseInt(localStorage.getItem('role') || '0', 10));
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    // Aquí deberías obtener el usuario y rol desde el backend
    this.userSubject.next({ name: 'Example User' }); // Reemplaza con datos reales
    this.roleSubject.next(2); // Ejemplo de rol, reemplaza con datos reales
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    this.userSubject.next(null);
    this.roleSubject.next(null);
  }

  setUser(user: any): void {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  setEmpresa(empresa: any): void {
    this.empresaSubject.next(empresa);
    localStorage.setItem('empresa', JSON.stringify(empresa));
  }

  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  getEmpresa(): Observable<any> {
    return this.empresaSubject.asObservable();
  }

  actualizarEmpresa(empresa: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/actualizar-empresa`, empresa);
  }

  getUserRole(): Observable<number | null> {
    return this.roleSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.userSubject.asObservable().pipe(map(user => !!user));
  }

}


