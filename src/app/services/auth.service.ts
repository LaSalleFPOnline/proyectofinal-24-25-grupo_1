import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3001/api'; // URL del servidor Node.js
  private tokenKey = 'authToken';
  private empresaSubject = new BehaviorSubject<any>(null);
  private roleSubject = new BehaviorSubject<number | null>(null);
  private userIdKey = 'userId'; // Clave para almacenar userId

  constructor(private http: HttpClient) {
    this.initializeAuthData();
  }

  private initializeAuthData(): void {
    const token = localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    const role = parseInt(localStorage.getItem('role') || sessionStorage.getItem('role') || '0', 10);
    const empresa = JSON.parse(localStorage.getItem('empresa') || sessionStorage.getItem('empresa') || '{}');
    const userId = localStorage.getItem(this.userIdKey) || sessionStorage.getItem(this.userIdKey);
  
    if (token) {
      this.roleSubject.next(role);
      sessionStorage.setItem(this.tokenKey, token); // Sincronizar con sessionStorage
      sessionStorage.setItem('role', role.toString());
      sessionStorage.setItem('empresa', JSON.stringify(empresa));
      sessionStorage.setItem(this.userIdKey, userId || '');
  }
  
    if (empresa && empresa.id) {
      this.empresaSubject.next(empresa);
    }
  
    if (userId) {
      console.log('User ID:', userId);
    } else {
      console.error('No se encontró User ID en sessionStorage.');
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(response => {
        console.log('Datos recibidos:', response); // Verifica la respuesta en la consola
        if (response && response.token && response.rol !== undefined) {
          // Guardar en sessionStorage
          sessionStorage.setItem(this.tokenKey, response.token);
          sessionStorage.setItem('role', response.rol.toString());
          sessionStorage.setItem('empresa', JSON.stringify(response.empresa));
          if (response.empresa) {
            this.setEmpresa(response.empresa);
          }
          
          if (response.user_id) {
            this.setUserId(response.user_id); // Asegúrate de que esto se llama con el ID correcto
          }
          // Guardar en localStorage
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem('role', response.rol.toString());
          this.roleSubject.next(response.rol);
          if (response.empresa) {
            localStorage.setItem('empresa', JSON.stringify(response.empresa));
        }
        if (response.user_id) {
            localStorage.setItem(this.userIdKey, response.user_id.toString());
        }

        this.roleSubject.next(response.rol);
        this.empresaSubject.next(response.empresa);
          return response;
        } else {
          console.error('Respuesta inválida del servidor:', response);
          throw new Error('Respuesta inválida del servidor.');
        }
      }),
      catchError((error: any) => {
        console.error('Error al intentar iniciar sesión:', error);
        throw error;
      })
    );
  }
  
  
  setToken(token: string, role: number): void {
    // Guardar en sessionStorage
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem('role', role.toString());
    
    // Guardar en localStorage
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem('role', role.toString());
    
    this.roleSubject.next(role);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  logout(): void {
    sessionStorage.clear();
    localStorage.clear(); // Limpia también el localStorage
    this.roleSubject.next(null);
    this.empresaSubject.next(null);
  }

  setEmpresa(empresa: any): void {
    // Verificar si la respuesta tiene la estructura que incluye 'data'
    if (empresa && empresa.data) {
        // Extraer los datos reales de la empresa
        empresa = empresa.data;
    }
    
    // Guardar los datos de la empresa en sessionStorage y localStorage
    this.empresaSubject.next(empresa);
    sessionStorage.setItem('empresa', JSON.stringify(empresa));
    localStorage.setItem('empresa', JSON.stringify(empresa));
    if (empresa && empresa.id) {
        sessionStorage.setItem('empresaId', empresa.id.toString());
        localStorage.setItem('empresaId', empresa.id.toString());
    }
  }

  setUserId(userId: number): void {
    console.log('Intentando guardar el userId:', userId);
    if (userId !== null && userId !== undefined) {
      sessionStorage.setItem(this.userIdKey, userId.toString());
      localStorage.setItem(this.userIdKey, userId.toString()); // Guardar también en localStorage
    } else {
      console.error('El ID de usuario es inválido');
    }
  }

  getUserId(): number | null {
    const id = sessionStorage.getItem(this.userIdKey) || localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }

  getLoggedInCompanyId(): number | null {
    const id = sessionStorage.getItem('empresaId');
    return id ? parseInt(id, 10) : null;
  }

  getEmpresa(): Observable<any> {
    return this.empresaSubject.asObservable();
  }

  actualizarEmpresa(empresa: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/actualizar-empresa`, empresa).pipe(
      map(response => {
        if (response && response.success && response.empresa) {
          this.setEmpresa(response.empresa);
        }
        return response;
      }),
      catchError((error: any) => {
        console.error('Error al actualizar la empresa:', error);
        throw error;
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
    const id = sessionStorage.getItem('empresaSeleccionadaId');
    return id ? parseInt(id, 10) : null;
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