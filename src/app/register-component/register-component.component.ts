/*import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegistroComponent {

  nombre: string = '';
  email: string = '';
  password: string = '';
  rol: number = 1; // 1: Empresa, 2: Visitante, 3: Administrador

  // Campos específicos para empresas
  web_url: string = '';
  spot_url: string = '';
  logo_url: string = '';
  descripcion: string = '';
  url_meet: string = '';
  horario_meet: string = '';

  // Campo específico para visitantes
  entidad: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    const userData = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: this.rol,
      web_url: this.web_url,
      spot_url: this.spot_url,
      logo_url: this.logo_url,
      descripcion: this.descripcion,
      url_meet: this.url_meet,
      horario_meet: this.horario_meet,
      entidad: this.entidad
    };

    console.log('Formulario enviado:', userData);

    this.authService.register(userData)
      .subscribe({
        next: (response) => {
          console.log('Usuario registrado exitosamente:', response);
          // Aquí puedes redirigir al usuario a una página de éxito o hacer cualquier otra acción necesaria
        },
        error: (error) => {
          console.error('Error al registrar usuario en el front:', error);
          // Aquí puedes manejar errores y mostrar mensajes al usuario
        },
        complete: () => {
          console.log('Proceso de registro completado');
        }
      });
  }
}*/




import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importar Router
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegistroComponent {

  nombre: string = '';
  email: string = '';
  password: string = '';
  rol: number = 1; // 1: Empresa, 2: Visitante, 3: Administrador

  // Campos específicos para empresas
  nombre_empresa: string = '';
  web_url: string = '';
  spot_url: string = '';
  logo_url: string = '';
  descripcion: string = '';
  url_meet: string = '';
  horario_meet: string = '';

  // Campo específico para visitantes
  entidad: string = '';

  constructor(private authService: AuthService, private router: Router) {}  // Inyectar Router

  onSubmit() {
    const userData = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: this.rol,
      nombre_empresa: this.nombre_empresa,
      web_url: this.web_url,
      spot_url: this.spot_url,
      logo_url: this.logo_url,
      descripcion: this.descripcion,
      url_meet: this.url_meet,
      /* Añadimos un valor por defecto en el campo de HORARIO MEET en caso de estar vacío al registrar */
      horario_meet: this.horario_meet || '00:00:00',
      entidad: this.entidad
    };

    console.log('Formulario enviado:', userData);

    this.authService.register(userData)
      .subscribe({
        next: (response) => {
          console.log('Usuario registrado exitosamente:', response);
          // Redirigir al usuario a la página de login
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al registrar usuario en el front:', error);
          // Aquí puedes manejar errores y mostrar mensajes al usuario
        },
        complete: () => {
          console.log('Proceso de registro completado');
        }
      });
  }
}