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

          // Guardar datos en el servicio (si lo necesitas para futuras consultas)
          this.authService.setUser(user);
          this.authService.setEmpresa(empresa);


          // Redirigir a la página correspondiente
          if (user.rol === 1) {
            this.router.navigate(['/empresa']);
          } else if (user.rol === 2) {
            this.router.navigate(['/feria']);
          } else if (user.rol === 3) {
            this.router.navigate(['/admin']);
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

          // Guardar datos en el servicio (si lo necesitas para futuras consultas)
          this.authService.setUser(user);
          this.authService.setEmpresa(empresa);

          // Redirigir a la página correspondiente basada en la respuesta del backend
          if (redirigir === 'feria') {
            this.router.navigate(['/feria']);
          } else if (redirigir === 'empresa') {
            this.router.navigate(['/empresa']);
          } else if (user.rol === 3) { // Administrador
            this.router.navigate(['/admin']);
          }
        },
        error: (error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorMessage = 'Credenciales inválidas';
        }
      });
  }
}

