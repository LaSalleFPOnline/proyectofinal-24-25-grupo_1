import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AgendaService } from '../services/agenda.service';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css'],
})

export class PerfilEmpresaComponent implements OnInit {

  entidad: string = '';
  enlaceSalaEspera: string = '';
  logotipo: string = '';
  spotPublicitario: string = '';
  nombreEmpresa: string = '';
  horario_meet_morning_start: string = '';
  horario_meet_morning_end: string = '';
  horario_meet_afternoon_start: string = '';
  horario_meet_afternoon_end: string = '';
  paginaWeb: string = '';
  descripcionProductos: string = '';
  contrasena?: string;
  repiteContrasena: string = '';
  nuevaContrasena: string = '';
  contrasenaErrorMessage: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  logoFile: File | null = null;
  logoPreview: string | null = null;
  id_usuario: number | null = null;
  id_empresa: number | null = null;
  horarioMananaError: string | null = null;
  horarioTardeError: string | null = null;
  fechaEdicionInicio: Date | null = null;
  fechaEdicionFin: Date | null = null;
  isEditable: boolean = false;
  userRole: number | null = null;
  @ViewChild('popupEdicionEmpresa') popupComponent!: PopupComponent;

  constructor(private authService: AuthService, private router: Router, private agendaService: AgendaService) {}

  ngOnInit() {
    const storedUser  = sessionStorage.getItem('user');
    const storedEmpresa = sessionStorage.getItem('empresa');
    const storedUserId = sessionStorage.getItem('userId');
    const storedEntidad = sessionStorage.getItem('entidad');
    if (storedEntidad) {
      this.entidad = storedEntidad;
    } else if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.entidad = user.entidad || '';
      } catch (error) {
        console.error('Error al parsear los datos del usuario:', error);
      }
    }
    this.authService.getUserRole().subscribe(role => {
      this.userRole = role;
    });
    if (storedUserId) {
      this.id_usuario = parseInt(storedUserId, 10);
      console.log('Usuario ID:', this.id_usuario);
    } else {
      console.error('No se encontró ID de usuario en sessionStorage.');
    }
    if (storedEmpresa) {
      try {
        const empresa = JSON.parse(storedEmpresa);
        this.enlaceSalaEspera = empresa.url_meet || '';
        this.logotipo = empresa.logo || '';
        this.spotPublicitario = empresa.spot || '';
        this.nombreEmpresa = empresa.nombre_empresa || '';
        this.horario_meet_morning_start = empresa.horario_meet_morning_start || '';
        this.horario_meet_morning_end = empresa.horario_meet_morning_end || '';
        this.horario_meet_afternoon_start = empresa.horario_meet_afternoon_start || '';
        this.horario_meet_afternoon_end = empresa.horario_meet_afternoon_end || '';
        this.paginaWeb = empresa.web || '';
        this.descripcionProductos = empresa.descripcion || '';
        this.id_empresa = empresa.id_empresa;
      } catch (error) {
        console.error('Error al parsear los datos de la empresa:', error);
      }
    } else {
      console.error('No se encontraron datos de la empresa.');
    }
    this.agendaService.obtenerFechasEdicion().subscribe({
      next: (fechas) => {
          if (fechas.length > 0) {
              this.fechaEdicionInicio = fechas[0].fechaEdicionInfoEmpresa_inicio || null;
              this.fechaEdicionFin = fechas[0].fechaEdicionInfoEmpresa_fin || null;
          } else {
              this.fechaEdicionInicio = null;
              this.fechaEdicionFin = null;
          }
          this.checkEditable();
          console.log('Fechas de edición:', this.fechaEdicionInicio, this.fechaEdicionFin);
          console.log('Estado de isEditable después de la verificación:', this.isEditable);
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
        const mensaje = `Lo sentimos, no puedes editar tu información porque estás fuera del periodo de edición de empresas. Este periodo empieza en ${fechaInicio.toLocaleDateString('es-ES')} hasta ${fechaFin.toLocaleDateString('es-ES')}.`;
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

  checkPasswords() {
    if (this.nuevaContrasena !== this.repiteContrasena) {
      this.contrasenaErrorMessage = 'Las contraseñas no coinciden.';
    } else {
      this.contrasenaErrorMessage = null;
    }
  }

  checkEditable() {
    const currentDate = new Date();
    if (this.fechaEdicionInicio && this.fechaEdicionFin) {
      this.isEditable = currentDate >= new Date(this.fechaEdicionInicio) && currentDate <= new Date(this.fechaEdicionFin);
      console.log('Fecha actual:', currentDate);
      console.log('isEditable:', this.isEditable);
    } else {
      console.warn('Las fechas de edición no están disponibles.');
      this.isEditable = false;
    }
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

  validarFormulario() {
    const storedUserId = localStorage.getItem('userId');
    const storedEmpresaId = localStorage.getItem('empresaId');
    this.id_usuario = storedUserId ? parseInt(storedUserId, 10) : null;
    this.id_empresa = storedEmpresaId ? parseInt(storedEmpresaId, 10) : null;
    if (this.userRole === 1) {
      if (!this.enlaceSalaEspera || !this.logotipo ||
        !this.nombreEmpresa || !this.paginaWeb) {
        this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
        return;
      }
      if (!this.horario_meet_morning_start && !this.horario_meet_afternoon_start) {
        this.errorMessage = 'Debe rellenar al menos uno de los campos de horario (mañana o tarde).';
        return;
      } else if (this.horarioMananaError || this.horarioTardeError) {
        this.errorMessage = 'Por favor, corrija los errores en los horarios.';
        return;
      }
    }
    if (!this.id_usuario) {
      this.errorMessage = 'ID de usuario o ID de empresa no disponibles.';
      return;
    } else if (this.nuevaContrasena && !this.repiteContrasena) {
      this.errorMessage = 'Por favor, repita la nueva contraseña.';
      return;
    } else if (this.repiteContrasena && !this.nuevaContrasena) {
      this.errorMessage = 'Por favor, ingrese la nueva contraseña.';
      return;
    } else if (this.nuevaContrasena && this.repiteContrasena && this.repiteContrasena !== this.nuevaContrasena) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    } else {
      this.errorMessage = null;
      this.contrasenaErrorMessage = null;
      if (this.userRole === 1) {
        const empresa = {
          id_empresa: this.id_empresa,
          id_usuario: this.id_usuario,
          nombre_empresa: this.nombreEmpresa,
          web: this.paginaWeb,
          spot: this.spotPublicitario,
          logo: this.logotipo,
          descripcion: this.descripcionProductos,
          url_meet: this.enlaceSalaEspera,
          horario_meet_morning_start: this.horario_meet_morning_start,
          horario_meet_morning_end: this.horario_meet_morning_end,
          horario_meet_afternoon_start: this.horario_meet_afternoon_start,
          horario_meet_afternoon_end: this.horario_meet_afternoon_end,
          entidad: this.entidad,
          role: this.userRole
        };
        if (this.nuevaContrasena) {
          (empresa as any).contrasena = this.nuevaContrasena;
        }
        const formData = new FormData();
        if (this.logoFile) {
          formData.append('logo', this.logoFile);
        }
        formData.append('empresa', JSON.stringify(empresa));
        formData.append('id_usuario', this.id_usuario.toString()); // Agregar el id_usuario como un campo separado
        formData.append('role', this.userRole.toString()); // Agregar el rol como un campo separado
        this.authService.actualizarEmpresa(formData).subscribe({
          next: (response: any) => {
            console.log('Datos actualizados:', response);
            this.successMessage = 'Datos de la empresa actualizados correctamente.';
            this.errorMessage = null;
            this.nombreEmpresa = response.nombre_empresa;
            this.paginaWeb = response.web;
            this.spotPublicitario = response.spot;
            this.logotipo = response.logo;
            this.descripcionProductos = response.descripcion;
            this.enlaceSalaEspera = response.url_meet;
            this.horario_meet_morning_start = response.horario_meet_morning_start;
            this.horario_meet_morning_end = response.horario_meet_morning_end;
            this.horario_meet_afternoon_start = response.horario_meet_afternoon_start;
            this.horario_meet_afternoon_end = response.horario_meet_afternoon_end;
            this.authService.setEmpresa(response);
            localStorage.setItem('popupMessage', "Has actualizado correctamente los datos de tu empresa");
            this.router.navigate(['/feria']);
            if (this.nuevaContrasena) {
              this.authService.cambiarContrasena({ usuarioId: this.id_usuario!, nuevaContrasena: this.nuevaContrasena }).subscribe({
                next: (response: any) => {
                  console.log('Contraseña actualizada:', response);
                  this.successMessage = 'Contraseña actualizada correctamente.';
                  this.errorMessage = null;
                },
                error: (error: any) => {
                  console.error('Error al cambiar la contraseña:', error);
                  this.errorMessage = 'Hubo un error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.';
                }
              });
            }
          },
          error: (error: any) => {
            console.error('Error al actualizar la empresa:', error);
            this.errorMessage = 'Hubo un error al actualizar la empresa. Por favor, inténtalo de nuevo más tarde.';
          }
        });
      } else if (this.userRole === 2 || this.userRole === 3) {
        if (this.nuevaContrasena) {
          this.authService.cambiarContrasena({ usuarioId: this.id_usuario!, nuevaContrasena: this.nuevaContrasena }).subscribe({
            next: (response: any) => {
              console.log('Contraseña actualizada:', response);
              this.successMessage = 'Contraseña actualizada correctamente.';
              this.errorMessage = null;
              localStorage.setItem('popupMessage', "La información ha sido actualizada correctamente.");
              this.router.navigate(['/feria']);
            },
            error: (error: any) => {
              console.error('Error al cambiar la contraseña:', error);
              this.errorMessage = 'Hubo un error al cambiar la contraseña. Por favor, inténtalo de nuevo más tarde.';
            }
          });
        } else {
          localStorage.setItem('popupMessage', "La información ha sido actualizada correctamente.");
          this.router.navigate(['/feria']);
        }
      }
    }
  }

  cambiarContrasena() {
    if (!this.nuevaContrasena || !this.id_usuario) {
      console.error('Usuario ID y nueva contraseña son obligatorios');
      return;
    }
    const requestBody = {
      usuarioId: this.id_usuario,
      nuevaContrasena: this.nuevaContrasena
    };
    this.authService.cambiarContrasena(requestBody).subscribe(
      response => {
        console.log('Contraseña cambiada con éxito:', response);
        this.errorMessage = null;
      },
      error => {
        console.error('Error al cambiar la contraseña:', error);
        this.errorMessage = 'Error al cambiar la contraseña'; // Manejo de error
      }
    );
  }

  validarHorarioManana() {
    if (this.horario_meet_morning_start && this.horario_meet_morning_end) {
      const startHour = parseInt(this.horario_meet_morning_start.split(":")[0]);
      const startMin = parseInt(this.horario_meet_morning_start.split(":")[1]);
      const endHour = parseInt(this.horario_meet_morning_end.split(":")[0]);
      const endMin = parseInt(this.horario_meet_morning_end.split(":")[1]);
      if (startHour < 10 || (startHour === 13 && startMin > 0) || startHour > 13) {
        this.horarioMananaError = 'La hora de inicio debe estar entre las 10:00 y las 13:00';
      } else if (endHour < 10 || (endHour === 13 && endMin > 0) || endHour > 13) {
        this.horarioMananaError = 'La hora de fin debe estar entre las 10:00 y las 13:00';
      } else {
        this.horarioMananaError = null;
      }
    }
  }

  validarHorarioTarde() {
    if (this.horario_meet_afternoon_start && this.horario_meet_afternoon_end) {
      const startHour = parseInt(this.horario_meet_afternoon_start.split(":")[0]);
      const startMin = parseInt(this.horario_meet_afternoon_start.split(":")[1]);
      const endHour = parseInt(this.horario_meet_afternoon_end.split(":")[0]);
      const endMin = parseInt(this.horario_meet_afternoon_end.split(":")[1]);
      if (startHour < 15 || (startHour === 15 && startMin < 30) || startHour > 18 || (startHour === 18 && startMin > 30)) {
        this.horarioTardeError = 'La hora de inicio debe estar entre las 15:30 y las 18:30';
      } else if (endHour < 15 || (endHour === 15 && endMin < 30) || endHour > 18 || (endHour === 18 && endMin > 30)) {
        this.horarioTardeError = 'La hora de fin debe estar entre las 15:30 y las 18:30';
      } else {
        this.horarioTardeError = null;
      }
    }
  }

}