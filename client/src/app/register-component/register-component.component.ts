// register-component.component.ts
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AgendaService } from '../services/agenda.service';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-register',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})

export class RegisterComponent implements AfterViewInit {

  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('rolInput') rolInput!: ElementRef;
  @ViewChild('popupEdicionRegistro') popupComponent!: PopupComponent;

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
  isEmailReadOnly: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  logoFile: File | null = null;
  logoPreview: string | null = null;
  horarioMananaError: string | null = null;
  horarioTardeError: string | null = null;
  fechaEdicionInicio: Date | null = null;
  fechaEdicionFin: Date | null = null;
  isEditable: boolean = false;

  //logoPreview: string | null = null; // Propiedad para la vista previa del logo

  constructor(private authService: AuthService, private router: Router, private agendaService: AgendaService) {}

  ngOnInit() {
    this.agendaService.obtenerFechasEdicion().subscribe({
      next: (fechas) => {
        if (fechas.length > 0) {
          this.fechaEdicionInicio = fechas[0].fechaEdicionInfoEmpresa_inicio || null;
          this.fechaEdicionFin = fechas[0].fechaEdicionInfoEmpresa_fin || null;
        } else {
          this.fechaEdicionInicio = null;
          this.fechaEdicionFin = null;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener fechas de edición:', error);
      }
    });
  }

  ngAfterViewInit() {
    this.agendaService.obtenerFechasEdicion().subscribe(fechas => {
      if (fechas.length === 0) {
        console.error('No se recibieron fechas de edición.');
        return;
      }
      const fechaEdicion = fechas[0];
      const fechaInicio = new Date(fechaEdicion.fechaEdicionInfoEmpresa_inicio);
      const fechaFin = new Date(fechaEdicion.fechaEdicionInfoEmpresa_fin);
      const ahora = new Date();
      if (ahora < fechaInicio || ahora > fechaFin) {
        const mensaje = `Lo sentimos, no puedes registrar tu información porque estás fuera del periodo de registro de nuevas empresas. Este periodo empieza en ${fechaInicio.toLocaleDateString('es-ES')} hasta ${fechaFin.toLocaleDateString('es-ES')}.`;
        console.log('Fecha de inicio:', fechaInicio);
        console.log('Fecha de fin:', fechaFin);
        if (this.popupComponent) {
          this.popupComponent.openPopup(true, mensaje, 'error');
        } else {
          console.error('popupComponent no está definido');
        }
      } else {
        this.isEditable = true;
      }
    }, error => {
      console.error('Error al obtener fechas de edición:', error);
    });
  }

  checkEditable() {
    const currentDate = new Date();
    if (this.fechaEdicionInicio && this.fechaEdicionFin) {
      this.isEditable = currentDate >= new Date(this.fechaEdicionInicio) && currentDate <= new Date(this.fechaEdicionFin);
      if (!this.isEditable) {
        const mensaje = `Lo sentimos, no puedes registrar tu información porque estás fuera del periodo de registro. Este periodo empieza en ${this.fechaEdicionInicio.toLocaleDateString('es-ES')} hasta ${this.fechaEdicionFin.toLocaleDateString('es-ES')}.`;
        if (this.popupComponent) {
          this.popupComponent.openPopup(true, mensaje, 'error');
        } else {
          console.error('popupComponent no está definido');
        }
      }
    } else {
      console.warn('Las fechas de edición no están disponibles.');
      this.isEditable = false;
    }
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
          console.log('Rol recibido:', this.rol);
        } else {
          console.warn('El rol no está definido en la respuesta del servidor. Verifica el backend.');
          this.errorMessage = 'El rol no está disponible. Por favor, contacta con soporte.';
          return;
        }
        if (response.message === 'El correo está registrado sin contraseña') {
          this.emailValidado = true;
          this.isEmailReadOnly = true;
          this.errorMessage = null;
          this.successMessage = null;
          this.loadForm();
        } else if (response.message === 'Credenciales inválidas') {
          this.errorMessage = 'No tienes permisos para continuar con el registro.';
          this.emailValidado = false;
          this.isEmailReadOnly = false;
        } else if (response.message === 'Este correo ya está registrado') {
          this.errorMessage = 'Este correo ya está registrado.';
          this.emailValidado = false;
          this.isEmailReadOnly = false;
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
          this.email = response.email;
          this.rol = response.rol;
          if (this.rol === 1) { // Empresa
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
          } else if (this.rol === 2) { // Visitante
            this.entidad = response.entidad || '';
          }
          if (this.emailInput) {
            this.emailInput.nativeElement.value = this.email;
            this.emailInput.nativeElement.setAttribute('readonly', 'true');
          }
          if (this.rolInput) {
            this.rolInput.nativeElement.value = this.getRolText(this.rol);
            this.rolInput.nativeElement.setAttribute('readonly', 'true');
          }
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
      if (!this.logoFile) missingFields.push('Logo');
      if (!this.url_meet) missingFields.push('URL Meet');
      if (!this.entidad) missingFields.push('Entidad');
      const isMorningSchedulePresent = this.horario_meet_morning_start && this.horario_meet_morning_end;
      const isAfternoonSchedulePresent = this.horario_meet_afternoon_start && this.horario_meet_afternoon_end;
      if (!isMorningSchedulePresent && !isAfternoonSchedulePresent) {
        missingFields.push('Horario de Meet (mañana o tarde)');
      }
      const isMorningValid = this.validarHorarioManana();
      const isAfternoonValid = this.validarHorarioTarde();
      if (!isMorningValid || !isAfternoonValid) {
        this.errorMessage = 'Los horarios proporcionados no son válidos.';
        return;
      }
    } else if (this.rol === 2) {  // Visitante
      if (!this.entidad) missingFields.push('Entidad');
    }
    if (missingFields.length > 0) {
      this.errorMessage = `Faltan los siguientes campos: ${missingFields.join(', ')}`;
      return;
    }
    this.errorMessage = null;
    this.submitForm();
  }

  onLogoFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  submitForm() {
    if (!this.email || !this.password || this.password !== this.confirmPassword) {
      this.errorMessage = 'Por favor, completa el formulario correctamente.';
      return;
    }
    const formData = new FormData();
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('rol', this.rol.toString());
    formData.append('nombre_empresa', this.nombre_empresa);
    formData.append('web', this.web_url);
    formData.append('spot', this.spot_url);
    formData.append('descripcion', this.descripcion);
    formData.append('url_meet', this.url_meet);
    formData.append('entidad', this.entidad);
    formData.append('horario_meet_morning_start', this.horario_meet_morning_start);
    formData.append('horario_meet_morning_end', this.horario_meet_morning_end);
    formData.append('horario_meet_afternoon_start', this.horario_meet_afternoon_start);
    formData.append('horario_meet_afternoon_end', this.horario_meet_afternoon_end);
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }
    this.authService.register(formData).subscribe({
      next: (response: any) => {
        this.successMessage = response.message;
        localStorage.setItem('popupMessage', "Registro completado. Bienvenido a la feria virtual La Salle Bussiness Match");
        localStorage.setItem('popupType', 'success');
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

  validarHorarioManana(): boolean {
    if (this.horario_meet_morning_start && this.horario_meet_morning_end) {
      const startHour = parseInt(this.horario_meet_morning_start.split(":")[0]);
      const startMin = parseInt(this.horario_meet_morning_start.split(":")[1]);
      const endHour = parseInt(this.horario_meet_morning_end.split(":")[0]);
      const endMin = parseInt(this.horario_meet_morning_end.split(":")[1]);
      if (startHour < 10 || (startHour === 13 && startMin > 0) || startHour > 13) {
        this.horarioMananaError = 'La hora de inicio debe estar entre las 10:00 y las 13:00';
        return false;
      } else if (endHour < 10 || (endHour === 13 && endMin > 0) || endHour > 13) {
        this.horarioMananaError = 'La hora de fin debe estar entre las 10:00 y las 13:00';
        return false;
      } else {
        this.horarioMananaError = null;
        return true;
      }
    }
    return true;
  }

  validarHorarioTarde(): boolean {
    if (this.horario_meet_afternoon_start && this.horario_meet_afternoon_end) {
      const startHour = parseInt(this.horario_meet_afternoon_start.split(":")[0]);
      const startMin = parseInt(this.horario_meet_afternoon_start.split(":")[1]);
      const endHour = parseInt(this.horario_meet_afternoon_end.split(":")[0]);
      const endMin = parseInt(this.horario_meet_afternoon_end.split(":")[1]);
      if (startHour < 15 || (startHour === 15 && startMin < 30) || startHour > 18 || (startHour === 18 && startMin > 30)) {
        this.horarioTardeError = 'La hora de inicio debe estar entre las 15:30 y las 18:30';
        return false;
      } else if (endHour < 15 || (endHour === 15 && endMin < 30) || endHour > 18 || (endHour === 18 && endMin > 30)) {
        this.horarioTardeError = 'La hora de fin debe estar entre las 15:30 y las 18:30';
        return false;
      } else {
        this.horarioTardeError = null;
        return true;
      }
    }
    return true;
  }

}