import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegistroComponent {

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordsDoNotMatch: boolean = false;
  alertShown: boolean = false;
  rol: number = 1; // 1: Empresa, 2: Visitante
  nombreColegio: string = '';

  // Campos específicos para empresas
  nombre_empresa: string = '';
  web_url: string = '';
  spot_url: string = '';
  logo_url: string = '';
  descripcion: string = '';
  url_meet: string = '';
  
  // Campo específico para visitantes
  entidad: string = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Nuevos campos para horarios SANTI
  horario_meet_morning_start: string = '';
  horario_meet_morning_end: string = '';
  horario_meet_afternoon_start: string = '';
  horario_meet_afternoon_end: string = '';

  constructor(private authService: AuthService, private router: Router) {}
    validarFormulario() {
      const missingFields: string[] = [];
  
      // Validaciones según el rol seleccionado
      if (!this.email) missingFields.push('Email');
      if (!this.password) missingFields.push('Contraseña');
  
      if (this.rol === 1) {  // Empresa
          if (!this.nombre_empresa) missingFields.push('Nombre de la Empresa');
          if (!this.web_url) missingFields.push('Web URL');
          if (!this.logo_url) missingFields.push('Logo URL');
          if (!this.url_meet) missingFields.push('URL Meet');
          if (!this.horario_meet_morning_start) missingFields.push('Horario Meet');
          if (!this.horario_meet_morning_end) missingFields.push('Horario Meet');
          if (!this.horario_meet_afternoon_start) missingFields.push('Horario Meet1');
          if (!this.horario_meet_afternoon_end) missingFields.push('Horario Meet1');
          if (!this.entidad) missingFields.push('Colegio');
      } else if (this.rol === 2) {  // Visitante
          if (!this.entidad) missingFields.push('Entidad');
      }
  
      // Si hay campos faltantes
      if (missingFields.length > 0) {
          this.errorMessage = `Por favor, completa los siguientes campos obligatorios: ${missingFields.join(', ')}.`;
          return;
      } else {
          this.errorMessage = null;
      }
  
      // Verificar si las contraseñas coinciden
      if (this.password !== this.confirmPassword) {
          this.passwordsDoNotMatch = true;
          alert('Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.');
          return;
      } else {
          this.passwordsDoNotMatch = false;
      }
  
      // Configuración de userData según el rol seleccionado
      const userData: any = {
          email: this.email,
          password: this.password,
          rol: this.rol,
          nombre_empresa: this.nombre_empresa,
          web_url: this.web_url,
          spot_url: this.spot_url || null, // Opcional
          logo_url: this.logo_url,
          descripcion: this.descripcion || null, // Opcional
          url_meet: this.url_meet,
          // horario_meet: this.horario_meet || '00:00', //VIEJO

          // Enviar horarios de mañana y tarde
        horario_meet_morning_start: this.horario_meet_morning_start,
        horario_meet_morning_end: this.horario_meet_morning_end,
        horario_meet_afternoon_start: this.horario_meet_afternoon_start,
        horario_meet_afternoon_end: this.horario_meet_afternoon_end,

        entidad: this.entidad,
      };
  
      console.log('Formulario enviado:', userData);
  
      // Llamada al servicio de registro
      this.authService.register(userData).subscribe({
          next: (response) => {
              console.log('Respuesta del servidor:', response);
              this.successMessage = 'Registro exitoso. Redirigiendo al login...';
              this.errorMessage = null;
              this.router.navigate(['/login']);  // Redirigir al login
          },
          error: (error) => {
              console.error('Error al registrar usuario:', error);
              if (error.status === 0) {
                  this.errorMessage = 'No se puede conectar con el servidor. Verifica la URL y tu conexión a Internet.';
              } else {
                  this.errorMessage = `Error: ${error.status} ${error.statusText}. ${error.error.message || 'Por favor, inténtelo de nuevo.'}`;
              }
              this.successMessage = null;
          },
          complete: () => {
              console.log('Proceso de registro completado');
          }
      });
  }
  

  checkPasswords() {
    if (this.password !== this.confirmPassword) {
      if (!this.alertShown) {
        this.alertShown = true;
        alert('Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.');
      }
      this.passwordsDoNotMatch = true;
      this.confirmPassword = '';  // Vaciar el campo
    } else {
      this.passwordsDoNotMatch = false;
      this.alertShown = false;  // Restablecer el estado de alerta si las contraseñas coinciden
    }
  }
}
