import { Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegistroComponent } from './register-component/register-component.component';

// Definir las rutas de la aplicación
export const routes: Routes = [
  { path: 'login', component: LoginComponentComponent },
  { path: 'register', component: RegistroComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' } // Redirige a login por defecto
];