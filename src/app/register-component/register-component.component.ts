// register-component.component.ts
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegisterComponent implements AfterViewInit {

  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('rolInput') rolInput!: ElementRef;

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordsDoNotMatch: boolean = false;
  alertShown: boolean = false;
  rol: number = 1; // 1: Empresa, 2: Visitante, 3: Admin
  nombre_empresa: string = '';
  web_url: string = '';
  spot_url: string = '';
  logo_url: string = '';
  descripcion: string = '';
  url_meet: string = '';
  entidad: string = '';
  horario_meet_morning_start: string = '';
  horario_meet_morning_end: string = '';
  horario_meet_afternoon_start: string = '';
  horario_meet_afternoon_end: string = '';

  emailValidado: boolean = false;
  isEmailReadOnly: boolean = false; // Nueva propiedad para controlar la edición del email
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    // `ViewChild` elements are now available here
  }

  validarEmail() {
    if (!this.email) {
        this.errorMessage = 'Por favor, introduce un email.';
        return;
    }

    this.authService.checkEmail(this.email).subscribe({
        next: (response: { message: string; rol?: number }) => {
            console.log('Respuesta del servidor:', response);

            if (response.rol !== undefined) {
                this.rol = response.rol;
                console.log('Rol recibido:', this.rol); // Mensaje de depuración
            } else {
                console.warn('El rol no está definido en la respuesta del servidor. Verifica el backend.');
                this.errorMessage = 'El rol no está disponible. Por favor, contacta con soporte.';
                return;
            }

            if (response.message === 'El correo está registrado sin contraseña') {
                this.emailValidado = true; // Habilita el formulario para editar
                this.isEmailReadOnly = true; // Hace el email de solo lectura
                this.errorMessage = null;
                this.successMessage = null;
                this.loadForm();
            } else if (response.message === 'Credenciales inválidas') {
                this.errorMessage = 'No tienes permisos para continuar con el registro.';
                this.emailValidado = false;
                this.isEmailReadOnly = false; // Permite volver a editar el email si es necesario
            } else if (response.message === 'Este correo ya está registrado') {
                this.errorMessage = 'Este correo ya está registrado.';
                this.emailValidado = false;
                this.isEmailReadOnly = false; // Permite volver a editar el email si es necesario
            }
        },
        error: (error: any) => {
            console.error('Error al validar el email:', error);
            this.errorMessage = 'Error al verificar el email. Inténtalo de nuevo.';
        }
    });
  }

  loadForm() {
    this.authService.getUserDetails(this.email).subscribe({
      next: (response: any) => {
        if (response) {
          // Rellenar los campos comunes
          this.email = response.email;
          this.rol = response.rol;

          // Establecer campos como readonly
          if (this.emailInput) {
            this.emailInput.nativeElement.value = this.email; // Asegúrate de que el valor se establece aquí
            this.emailInput.nativeElement.setAttribute('readonly', 'true');
          }
          if (this.rolInput) {
            this.rolInput.nativeElement.value = this.getRolText(this.rol); // Asegúrate de que el valor se establece aquí
            this.rolInput.nativeElement.setAttribute('readonly', 'true');
          }

          // Mostrar campos adicionales según el rol
          if (this.rol === 1) {
            // Empresa
            this.nombre_empresa = response.nombre_empresa || '';
            this.web_url = response.web_url || '';
            this.spot_url = response.spot_url || '';
            this.logo_url = response.logo_url || '';
            this.descripcion = response.descripcion || '';
            this.url_meet = response.url_meet || '';
            this.horario_meet_morning_start = response.horario_meet_morning_start || '';
            this.horario_meet_morning_end = response.horario_meet_morning_end || '';
            this.horario_meet_afternoon_start = response.horario_meet_afternoon_start || '';
            this.horario_meet_afternoon_end = response.horario_meet_afternoon_end || '';
            this.entidad = response.entidad || '';
          } else if (this.rol === 2) {
            // Visitante
            this.entidad = response.entidad || '';
          }

          // Ocultar mensaje de error
          this.errorMessage = null;
        } else {
          this.errorMessage = 'No se pudo cargar la información del usuario. Inténtalo de nuevo.';
        }
      },
      error: (error: any) => {
        console.error('Error al cargar los datos del usuario:', error);
        this.errorMessage = 'Error al cargar los datos del usuario. Inténtalo de nuevo.';
      }
    });
  }

  validarFormulario() {
    const missingFields: string[] = [];

    if (!this.email) missingFields.push('Email');
    if (!this.password) missingFields.push('Contraseña');
    if (this.password !== this.confirmPassword) {
      this.passwordsDoNotMatch = true;
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    this.passwordsDoNotMatch = false;

    if (this.rol === 1) {  // Empresa
      if (!this.nombre_empresa) missingFields.push('Nombre de la Empresa');
      if (!this.web_url) missingFields.push('Web URL');
      if (!this.logo_url) missingFields.push('Logo URL');
      if (!this.url_meet) missingFields.push('URL Meet');
      if (!this.horario_meet_morning_start || !this.horario_meet_morning_end) missingFields.push('Horario Meet');
      if (!this.horario_meet_afternoon_start || !this.horario_meet_afternoon_end) missingFields.push('Horario Meet1');
      if (!this.entidad) missingFields.push('Entidad');
    } else if (this.rol === 2) {  // Visitante
      if (!this.entidad) missingFields.push('Entidad');
    }

    if (missingFields.length > 0) {
      this.errorMessage = `Faltan los siguientes campos: ${missingFields.join(', ')}`;
      return;
    }
    this.errorMessage = null;

    // Si llega aquí, el formulario es válido
    this.submitForm();
  }

  submitForm() {
    // Lógica para enviar el formulario
    if (!this.email || !this.password || this.password !== this.confirmPassword) {
      this.errorMessage = 'Por favor, completa el formulario correctamente.';
      return;
    }

    const formData = {
      email: this.email,
      password: this.password,
      rol: this.rol,
      nombre_empresa: this.nombre_empresa,
      web_url: this.web_url,
      spot_url: this.spot_url,
      logo_url: this.logo_url,
      descripcion: this.descripcion,
      url_meet: this.url_meet,
      entidad: this.entidad,
      horario_meet_morning_start: this.horario_meet_morning_start,
      horario_meet_morning_end: this.horario_meet_morning_end,
      horario_meet_afternoon_start: this.horario_meet_afternoon_start,
      horario_meet_afternoon_end: this.horario_meet_afternoon_end
    };

    this.authService.register({
      email: this.email,
      password: this.password,
      rol: this.rol,
      nombre_empresa: this.nombre_empresa,
      web_url: this.web_url,
      spot_url: this.spot_url,
      logo_url: this.logo_url,
      descripcion: this.descripcion,
      url_meet: this.url_meet,
      horario_meet_morning_start: this.horario_meet_morning_start,
      horario_meet_morning_end: this.horario_meet_morning_end,
      horario_meet_afternoon_start: this.horario_meet_afternoon_start,
      horario_meet_afternoon_end: this.horario_meet_afternoon_end,
      entidad: this.entidad
    }).subscribe({
      next: (response: any) => {
        this.successMessage = response.message;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.errorMessage = 'Error al registrar el usuario. Inténtalo de nuevo.';
      }
    });
    
  }

  checkPasswords() {
    if (this.password !== this.confirmPassword) {
      this.passwordsDoNotMatch = true;
    } else {
      this.passwordsDoNotMatch = false;
    }
  }

  getRolText(rol: number): string {
    switch (rol) {
      case 1: return 'Empresa';
      case 2: return 'Visitante';
      case 3: return 'Administrador';
      default: return 'Desconocido';
    }
  }
}