import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          // Aquí puedes redirigir al usuario a una página de éxito o hacer cualquier otra acción necesaria
          const user = response.user;
          switch (user.rol) {
            case 1:
              this.router.navigate(['/feria']);
              break;
            case 2:
              this.router.navigate(['/empresa']);
              break;
            case 3:
              this.router.navigate(['/admin']);
              break;
            default:
              console.log('Rol desconocido: ', user.rol);
              this.errorMessage = 'Rol desconocido';
          }
        },
        error: (error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorMessage = 'Credenciales inválidas';
        }
      });
  }
}
