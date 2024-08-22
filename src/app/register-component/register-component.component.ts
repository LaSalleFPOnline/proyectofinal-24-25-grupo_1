import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importar Router
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-registro',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegistroComponent {

  // nombre: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordsDoNotMatch: boolean = false;
  alertShown: boolean = false;
  rol: number = 1; // 1: Empresa, 2: Visitante, 3: Administrador
  nombreColegio: string = '';
  colegios: string[] = [];

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
      // nombre: this.nombre,
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

    this.authService.getEmpresa().subscribe((empresa: any) => {
      if (empresa) {
        this.nombreColegio = empresa.entidad || '';
        // Otras asignaciones...
      } else {
        console.error('No se encontraron datos de la empresa.');
      }
    });
  }
  checkPasswords(confirmPasswordInput: HTMLInputElement) {
    if (this.password !== this.confirmPassword) {
      if (!this.alertShown) {
        this.alertShown = true; // Marcar que la alerta ha sido mostrada
        alert('Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.');
      }
      this.passwordsDoNotMatch = true;
      this.confirmPassword = ''; // Vaciar el campo
      confirmPasswordInput.focus(); // Enfocar de nuevo el campo
    } else {
      this.passwordsDoNotMatch = false;
      this.alertShown = false; // Restablecer el estado de alerta si las contraseñas coinciden
    }
  }
}