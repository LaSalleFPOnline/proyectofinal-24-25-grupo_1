/*import { Component } from '@angular/core';
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
          const user = response.user;
          const empresa = response.empresa;
          const redirigir = response.redirigir;
          const token = response.token;  // Asegúrate de que el token viene en la respuesta

          // Guardar el token en el localStorage
          if (token) {
            this.authService.setToken(token);
          }

          // Guardar datos en el servicio (si lo necesitas para futuras consultas)
          this.authService.setUser(user);
          this.authService.setEmpresa(empresa);

       
        /// Verificar el rol del usuario
          if (user && user.rol === 3) { // Administrador
            this.router.navigate(['/admin']);
          } else if (redirigir === 'feria') {
            this.router.navigate(['/feria']);
          } else if (redirigir === 'empresa') {
            this.router.navigate(['/empresa']);
          } else {
            this.errorMessage = 'No se pudo determinar la ruta de redirección';
          }
        },
        error: (error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorMessage = 'Credenciales inválidas';
        }
      });
  }
}*/
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
          const user = response.user;
          const empresa = response.empresa;
          const redirigir = response.redirigir;
          const token = response.token;

          // Guardar el token, usuario y rol en el servicio
          if (token) {
            this.authService.setToken(token, user, user.rol);
          }

          // Guardar la empresa en el servicio (si lo necesitas para futuras consultas)
          this.authService.setEmpresa(empresa);

          // Verificar el rol del usuario y redirigir
          if (user && user.rol === 3) { // Administrador
            this.router.navigate(['/admin']);
          } else if (redirigir === 'feria') {
            this.router.navigate(['/feria']);
          } else if (redirigir === 'empresa') {
            this.router.navigate(['/empresa']);
          } else {
            this.errorMessage = 'No se pudo determinar la ruta de redirección';
          }
        },
        error: (error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorMessage = 'Credenciales inválidas';
        }
      });
  }
}
