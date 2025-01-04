import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private userIdKey = 'userId';
  private userKey = 'user';
  private roleSubject = new BehaviorSubject<number | null>(null);
  private empresaSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.initializeAuthData();
  }

  private decodeJwtToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('El token JWT no tiene el formato correcto.');
    }
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  private initializeAuthData(): void {
    const token = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    const role = parseInt(localStorage.getItem('role') || sessionStorage.getItem('role') || '0', 10);
    const empresa = JSON.parse(localStorage.getItem('empresa') || sessionStorage.getItem('empresa') || '{}');
    const userId = localStorage.getItem(this.userIdKey) || sessionStorage.getItem(this.userIdKey);
    const user = JSON.parse(localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey) || '{}');
    const entidad = localStorage.getItem('entidad') || sessionStorage.getItem('entidad') || '';
    if (token) {
      this.roleSubject.next(role);
      sessionStorage.setItem(this.tokenKey, token);
      sessionStorage.setItem('role', role.toString());
      sessionStorage.setItem('empresa', JSON.stringify(empresa));
      sessionStorage.setItem(this.userIdKey, userId || '');
      sessionStorage.setItem(this.userKey, JSON.stringify(user));
      sessionStorage.setItem('entidad', entidad);
    }
    if (empresa && empresa.id_empresa) {
      empresa.id = empresa.id || empresa.id_empresa;
      this.empresaSubject.next(empresa);
      sessionStorage.setItem('empresaId', empresa.id.toString());
    } else {
      console.error('No se encontró empresa en sessionStorage.');
    }
    if (userId) {
      console.log('User ID:', userId);
    } else {
      console.error('No se encontró User ID en sessionStorage.');
    }
    if (user) {
      console.log('Usuario:', user);
    } else {
      console.error('No se encontró el usuario en sessionStorage.');
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        console.log('Datos recibidos:', response);
        if (response && response.token) {
          this.setToken(response.token, response.rol, response.entidad || '');
          if (response.empresa) {
            this.setEmpresa(response.empresa);
          }
          try {
            const decodedToken = this.decodeJwtToken(response.token);
            if (decodedToken && decodedToken.id) {
              this.setUserId(decodedToken.id);
            } else {
              console.error('No se pudo encontrar el ID de usuario en el token decodificado.');
            }
          } catch (error) {
            console.error('Error al decodificar el token JWT:', error);
          }
          if (response.user) {
            this.setUser(response.user);
          } else {
            console.warn('No se encontraron datos del usuario en la respuesta.');
          }
          return response;
        } else {
          console.error('Respuesta inválida del servidor:', response);
          throw new Error('Respuesta inválida del servidor.');
        }
      }),
      catchError((error: any) => {
        console.error('Error al intentar iniciar sesión:', error);
        return throwError(error);
      })
    );
  }

  cambiarContrasena(data: { usuarioId: number; nuevaContrasena: string }) {
    return this.http.put(`${this.apiUrl}/cambiar-contrasena`, data);
  }

  setToken(token: string, role: number, entidad: string): void {
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem('role', role.toString());
    sessionStorage.setItem('entidad', entidad);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('role', role.toString());
    localStorage.setItem('entidad', entidad);
    this.roleSubject.next(role);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  logout(): void {
    sessionStorage.clear();
    localStorage.clear();
    this.roleSubject.next(null);
    this.empresaSubject.next(null);
  }

  setEmpresa(empresa: any): void {
    if (empresa && empresa.data) {
        empresa = empresa.data;
    }
    this.empresaSubject.next(empresa);
    sessionStorage.setItem('empresa', JSON.stringify(empresa));
    localStorage.setItem('empresa', JSON.stringify(empresa));
    if (empresa && empresa.id_empresa) {
        sessionStorage.setItem('empresaId', empresa.id_empresa.toString());
        localStorage.setItem('empresaId', empresa.id_empresa.toString());
    }
  }

  setUserId(userId: number): void {
    console.log('Intentando guardar el userId:', userId);
    if (userId !== null && userId !== undefined) {
      sessionStorage.setItem(this.userIdKey, userId.toString());
      localStorage.setItem(this.userIdKey, userId.toString());
    } else {
      console.error('El ID de usuario es inválido');
    }
  }

  getUserId(): number | null {
    const userId = sessionStorage.getItem(this.userIdKey) || localStorage.getItem(this.userIdKey);
    return userId ? parseInt(userId, 10) : null;
  }

  setUser(user: { id: number; email: string; rol: number; entidad?: string }): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): { id: number; email: string; rol: number; entidad?: string } | null {
    const user = JSON.parse(sessionStorage.getItem(this.userKey) || 'null');
    return user ? user : null;
  }

  getLoggedInCompanyId(): number | null {
    const id = sessionStorage.getItem('empresaId');
    return id ? parseInt(id, 10) : null;
  }

  getEmpresa(): Observable<any> {
    return this.empresaSubject.asObservable();
  }

  actualizarEmpresa(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/actualizar-empresa`, formData).pipe(
      map(response => {
        if (response && response.success && response.empresa) {
          this.setEmpresa(response.empresa);
        }
        return response;
      }),
      catchError((error: any) => {
        console.error('Error al actualizar la empresa:', error);
        return throwError(error);
      })
    );
  }

  getUserRole(): Observable<number | null> {
    return this.roleSubject.asObservable();
  }

  isLoggedIn(): Observable<boolean> {
    return this.roleSubject.asObservable().pipe(map(role => !!role));
  }

  setEmpresaSeleccionadaId(empresaId: number | null): void {
    if (empresaId !== null && empresaId !== undefined) {
      sessionStorage.setItem('empresaSeleccionadaId', empresaId.toString());
    } else {
      console.error('El ID de la empresa es inválido');
    }
  }

  getEmpresaSeleccionadaId(): number | null {
    const empresaId = sessionStorage.getItem('empresaId') || localStorage.getItem('empresaId');
    if (empresaId) {
      return parseInt(empresaId, 10);
    } else {
      console.error('No se encontró el ID de la empresa en sessionStorage.');
      return null;
    }
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-email`, {
      params: { email }
    });
  }

  getUserDetails(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user-details`, {
      params: { email }
    });
  }

}