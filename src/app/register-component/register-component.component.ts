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
  horario_meet: string = '';

  // Campo específico para visitantes
  entidad: string = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  validarFormulario() {
    const missingFields: string[] = [];

    // Validaciones según el rol seleccionado
    if (!this.email) missingFields.push('Email');
    if (!this.password) missingFields.push('Contraseña');

    if (this.rol === 1) {  // Empresa
      if (!this.email) missingFields.push('Email');
      if (!this.password) missingFields.push('Contraseña');
      if (!this.nombre_empresa) missingFields.push('Nombre de la Empresa');
      if (!this.web_url) missingFields.push('Web URL');
      if (!this.logo_url) missingFields.push('Logo URL');
      if (!this.descripcion) missingFields.push('Descripción de productos o servicios');
      if (!this.url_meet) missingFields.push('URL Meet');
      if (!this.horario_meet) missingFields.push('Horario Meet');
    } else if (this.rol === 2) {  // Visitante
      if (!this.email) missingFields.push('Email');
      if (!this.password) missingFields.push('Contraseña');
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
      if (!this.alertShown) {
        this.alertShown = true;
        alert('Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.');
      }
      this.passwordsDoNotMatch = true;
      this.confirmPassword = '';  // Vaciar el campo
      return;
    } else {
      this.passwordsDoNotMatch = false;
      this.alertShown = false;  // Restablecer el estado de alerta si las contraseñas coinciden
    }

    // Configuración de userData según el rol seleccionado
    const userData: any = {
      email: this.email,
      password: this.password,
      rol: this.rol,
    };

    if (this.rol === 1) {  // Empresa
      userData.nombre_empresa = this.nombre_empresa;
      userData.web_url = this.web_url;
      userData.spot_url = this.spot_url;
      userData.logo_url = this.logo_url;
      userData.descripcion = this.descripcion;
      userData.url_meet = this.url_meet;
      userData.horario_meet = this.horario_meet || '00:00';
      userData.entidad = this.entidad;
    } else if (this.rol === 2) {  // Visitante
      userData.entidad = this.entidad;
    }

    console.log('Formulario enviado:', userData);

    // Llamada al servicio de registro
    this.authService.register(userData).subscribe({
      next: (response) => {      
        console.log('Respuesta del servidor:', response);

        console.log('Usuario registrado exitosamente:', response);
        this.successMessage = 'Registro exitoso. Redirigiendo al login...';
        this.errorMessage = null;
        this.router.navigate(['/login']);  // Redirigir al login
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        // Extraer más detalles del error
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
