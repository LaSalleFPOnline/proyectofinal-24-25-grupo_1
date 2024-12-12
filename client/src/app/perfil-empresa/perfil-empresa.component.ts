import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AgendaService } from '../services/agenda.service'; // Importar el servicio de agenda
import { PopupComponent } from '../popup/popup.component'; // Importar el componente popup

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
  contrasena: string = '';
  repiteContrasena: string = '';
  nuevaContrasena: string = ''; // Declarar nuevaContrasena aquí
  contrasenaErrorMessage: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  id_usuario: number | null = null;
  id_empresa: number | null = null; // Añadido para almacenar el ID de la empresa

  horarioMananaError: string | null = null;
  horarioTardeError: string | null = null;

  fechaEdicionInicio: Date | null = null;
  fechaEdicionFin: Date | null = null;
  isEditable: boolean = false;
  @ViewChild('popupEdicionEmpresa') popupComponent!: PopupComponent;

  constructor(private authService: AuthService, private router: Router, private agendaService: AgendaService) {}

  ngOnInit() {
    const storedUser  = sessionStorage.getItem('user');
    const storedEmpresa = sessionStorage.getItem('empresa');
    const storedUserId = sessionStorage.getItem('userId');
    const storedEntidad = sessionStorage.getItem('entidad');

    // Obtener entidad
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

    // Obtener ID de usuario
    if (storedUserId) {
      this.id_usuario = parseInt(storedUserId, 10); // Asignar ID de usuario
      console.log('Usuario ID:', this.id_usuario); // Agregar este log
    } else {
      console.error('No se encontró ID de usuario en sessionStorage.');
    }

    // Obtener datos de la empresa
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
        this.id_empresa = empresa.id_empresa; // Asignar ID de empresa desde los datos
      } catch (error) {
        console.error('Error al parsear los datos de la empresa:', error);
      }
    } else {
      console.error('No se encontraron datos de la empresa.');
    }

    // Obtener las fechas de edición de la API
    this.agendaService.obtenerFechasEdicion().subscribe({
      next: (fechas) => {
          // Asegúrate de que las fechas estén en el formato correcto
          if (fechas.length > 0) {
              this.fechaEdicionInicio = fechas[0].fechaEdicionInfoEmpresa_inicio || null; // Asigna null si no existe
              this.fechaEdicionFin = fechas[0].fechaEdicionInfoEmpresa_fin || null; // Asigna null si no existe
          } else {
              this.fechaEdicionInicio = null;
              this.fechaEdicionFin = null;
          }
          this.checkEditable(); // Llamar a la función checkEditable

          // Registro de las fechas y el estado de isEditable
          console.log('Fechas de edición:', this.fechaEdicionInicio, this.fechaEdicionFin);
          console.log('Estado de isEditable después de la verificación:', this.isEditable);
          // Mostrar el popup si no es editable
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

        // Verificar si el periodo de edición es válido
        if (ahora < fechaInicio || ahora > fechaFin) {
            const mensaje = `Lo sentimos, no puedes editar tu información porque estás fuera del periodo de edición de empresas. Este periodo empieza en ${fechaInicio.toLocaleDateString('es-ES')} hasta ${fechaFin.toLocaleDateString('es-ES')}.`;
            console.log('Fecha de inicio:', fechaInicio);
            console.log('Fecha de fin:', fechaFin);
            
            // Mostrar el popup con el mensaje
            if (this.popupComponent) {
                this.popupComponent.openPopup(true, mensaje);
            } else {
                console.error('popupComponent no está definido');
            }
        } else {
            // Si el periodo es válido, puedes realizar otras acciones aquí si es necesario
            this.isEditable = true; // O cualquier otra lógica que necesites
        }
    }, error => {
        console.error('Error al obtener fechas de edición:', error);
    });
  }
  

  checkEditable() {
    const currentDate = new Date();
    // Verificar que las fechas no sean nulas antes de realizar la comparación
    if (this.fechaEdicionInicio && this.fechaEdicionFin) {
        this.isEditable = currentDate >= new Date(this.fechaEdicionInicio) && currentDate <= new Date(this.fechaEdicionFin);
        console.log('Fecha actual:', currentDate);
        console.log('isEditable:', this.isEditable);
    } else {
        console.warn('Las fechas de edición no están disponibles.');
        this.isEditable = false; // Establecer a false si las fechas son nulas
    }
  }

  validarFormulario() {
    // Obtener los IDs desde sessionStorage cada vez que se valida el formulario
    const storedUserId = sessionStorage.getItem('userId');
    const storedEmpresaId = sessionStorage.getItem('empresaId');
    this.id_usuario = storedUserId ? parseInt(storedUserId, 10) : null;
    this.id_empresa = storedEmpresaId ? parseInt(storedEmpresaId, 10) : null;

    // Validar el formulario
    if (!this.enlaceSalaEspera || !this.logotipo ||
      !this.nombreEmpresa || !this.paginaWeb) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    } else if (!this.id_usuario || !this.id_empresa) {
      this.errorMessage = 'ID de usuario o ID de empresa no disponibles.';
      return;  // Detener la ejecución si los IDs no están disponibles
    } else if (!this.horario_meet_morning_start && !this.horario_meet_afternoon_start) {
      this.errorMessage = 'Debe rellenar al menos uno de los campos de horario (mañana o tarde).';
      return;  // Detener la ejecución si no hay horarios
    } else if (this.horarioMananaError || this.horarioTardeError) {  // Agregar validación de errores de horario
      this.errorMessage = 'Por favor, corrija los errores en los horarios.';
      return;  // Detener la ejecución si hay errores en los horarios
    } else if (this.contrasena && this.repiteContrasena !== this.contrasena) {
      this.contrasenaErrorMessage = 'Las contraseñas no coinciden.';
      return;  // Detener la ejecución si las contraseñas no coinciden
    } else {
      this.errorMessage = null;
      this.contrasenaErrorMessage = null;

      const empresa = {
        id_empresa: this.id_empresa,
        id_usuario: this.id_usuario,
        nombre_empresa: this.nombreEmpresa,
        web: this.paginaWeb,
        spot: this.spotPublicitario,
        logo: this.logotipo,
        descripcion: this.descripcionProductos,
        url_meet: this.enlaceSalaEspera,
        horario_meet_morning_start: this.horario_meet_morning_start || null,
        horario_meet_morning_end: this.horario_meet_morning_end || null,
        horario_meet_afternoon_start: this.horario_meet_afternoon_start || null,
        horario_meet_afternoon_end: this.horario_meet_afternoon_end || null,
        entidad: this.entidad,
        contrasena: this.contrasena // Agregar contrasena al objeto si existe
      };
      // Si las contraseñas son válidas, cambia la contraseña
      this.cambiarContrasena();

      this.authService.actualizarEmpresa(empresa).subscribe({
        next: (response: any) => {
          console.log('Datos actualizados:', response);
          this.successMessage = 'Datos de la empresa actualizados correctamente.';
          this.errorMessage = null;

          // Actualizamos los datos en el formulario con la respuesta
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

          // Actualiza también el sessionStorage
          this.authService.setEmpresa(response);

          // Redirigir a la página '/feria'
          this.router.navigate(['/feria']);
        },
        error: (error: any) => {
          console.error('Error al actualizar la empresa:', error);
          this.errorMessage = 'Hubo un error al actualizar la empresa. Por favor, inténtelo de nuevo.';
          this.successMessage = null;
        }
      });
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
        // Aquí puedes agregar lógica adicional, como un mensaje de éxito en la UI
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

      // Validar que la hora de inicio esté entre las 10:00 y las 13:00
      if (startHour < 10 || (startHour === 13 && startMin > 0) || startHour > 13) {
        this.horarioMananaError = 'La hora de inicio debe estar entre las 10:00 y las 13:00';
      } else if (endHour < 10 || (endHour === 13 && endMin > 0) || endHour > 13) {
        this.horarioMananaError = 'La hora de fin debe estar entre las 10:00 y las 13:00';
      } else {
        this.horarioMananaError = null; // Reseteamos el error si la validación es correcta
      }
    }
  }

  validarHorarioTarde() {
    if (this.horario_meet_afternoon_start && this.horario_meet_afternoon_end) {
      const startHour = parseInt(this.horario_meet_afternoon_start.split(":")[0]);
      const startMin = parseInt(this.horario_meet_afternoon_start.split(":")[1]);
      const endHour = parseInt(this.horario_meet_afternoon_end.split(":")[0]);
      const endMin = parseInt(this.horario_meet_afternoon_end.split(":")[1]);

      // Validar que la hora de inicio esté entre las 15:30 y las 18:30
      if (startHour < 15 || (startHour === 15 && startMin < 30) || startHour > 18 || (startHour === 18 && startMin > 30)) {
        this.horarioTardeError = 'La hora de inicio debe estar entre las 15:30 y las 18:30';
      } else if (endHour < 15 || (endHour === 15 && endMin < 30) || endHour > 18 || (endHour === 18 && endMin > 30)) {
        this.horarioTardeError = 'La hora de fin debe estar entre las 15:30 y las 18:30';
      } else {
        this.horarioTardeError = null; // Reseteamos el error si la validación es correcta
      }
    }
  }
}