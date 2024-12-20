import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        return this.authService.isLoggedIn().pipe(
        take(1),
        map((isLoggedIn: boolean) => {
            if (isLoggedIn) {
            return true;
            } else {
            this.router.navigate(['/login']); // Redirige al login si no está autenticado
            return false;
            }
        })
        );
    }
}