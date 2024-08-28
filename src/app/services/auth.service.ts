import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    const token = sessionStorage.getItem(this.tokenKey);
    if (token) {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const role = parseInt(sessionStorage.getItem('role') || '0', 10);
      this.userSubject.next(user);
      this.roleSubject.next(role);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(map(response => {
        if (response.token) {
          // Guardar el token, usuario y rol usando el método setToken
          this.setToken(response.token, response.user, response.user.rol);
        }
        return response;
      }));
  }

  setToken(token: string, user: any, role: number): void {
    sessionStorage.setItem(this.tokenKey, token);
    this.setUser(user);  // Guarda el usuario y notifica el cambio
    this.roleSubject.next(role);
    sessionStorage.setItem('role', role.toString());
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('empresa');
    this.userSubject.next(null);
    this.roleSubject.next(null);
    this.empresaSubject.next(null);
  }

  setUser(user: any): void {
    this.userSubject.next(user);
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  setEmpresa(empresa: any): void {
    this.empresaSubject.next(empresa);
    sessionStorage.setItem('empresa', JSON.stringify(empresa));

    // Guarda el ID de la empresa logueada en sessionStorage
    if (empresa && empresa.id) {
      sessionStorage.setItem('empresaId', empresa.id.toString());
    }
  }

  getLoggedInCompanyId(): number | null {
    const id = sessionStorage.getItem('empresaId');
    return id ? parseInt(id, 10) : null;
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

  // Guardar el ID de la empresa seleccionada para mostrar detalles
  setEmpresaSeleccionadaId(empresaId: number | null): void {
    if (empresaId !== null && empresaId !== undefined) {
      sessionStorage.setItem('empresaSeleccionadaId', empresaId.toString());
    } else {
      console.error('El ID de la empresa es inválido');
    }
  }
  

  // Obtener el ID de la empresa seleccionada para mostrar detalles
  getEmpresaSeleccionadaId(): number | null {
    const id = sessionStorage.getItem('empresaSeleccionadaId');
    return id ? parseInt(id, 10) : null;
  }
}