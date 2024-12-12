import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Obtén el rol requerido de la configuración de la ruta
    const requiredRole = route.data['role'];

    return this.authService.getUserRole().pipe(
      take(1),
      map((role: number | null) => {
        if (role === requiredRole) {
          return true;
        } else {
          this.router.navigate(['/login']); // Redirige al login si el rol no coincide
          return false;
        }
      })
    );
  }
}
