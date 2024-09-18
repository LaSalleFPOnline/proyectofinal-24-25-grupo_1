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
  
          if (response && response.token && response.rol !== undefined) {
            this.authService.setToken(response.token, response.rol);
  
            if (response.empresa) {
              this.authService.setEmpresa(response.empresa);
            }
            
            // Asegúrate de que el user_id está disponible
            if (response.empresa && response.empresa.usuario_id) {
              this.authService.setUserId(response.empresa.usuario_id); // Verifica que esto se llama con el ID correcto
            }
  
            if (response.rol === 3) { // Administrador
              this.router.navigate(['/admin']);
            } else if (response.rol === 2) { // Visitante
              this.router.navigate(['/feria']);
            } else if (response.rol === 1) { // Empresa
              this.router.navigate(['/empresa']);
            } else {
              this.errorMessage = 'No se pudo determinar la ruta de redirección';
            }
          } else {
            this.errorMessage = 'Respuesta del servidor inválida';
          }
        },
        error: (error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorMessage = 'Credenciales inválidas';
        }
      });
  }
  

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}