import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
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
  usuario_id: number | null = null;
  empresa_id: number | null = null; // Añadido para almacenar el ID de la empresa

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const storedUser = sessionStorage.getItem('user');
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
      this.usuario_id = parseInt(storedUserId, 10); // Asignar ID de usuario
      console.log('Usuario ID:', this.usuario_id); // Agregar este log
    } else {
      console.error('No se encontró ID de usuario en sessionStorage.');
    }

    // Obtener datos de la empresa
    if (storedEmpresa) {
      try {
        const empresa = JSON.parse(storedEmpresa);
        this.enlaceSalaEspera = empresa.url_meet || '';
        this.logotipo = empresa.logo_url || '';
        this.spotPublicitario = empresa.spot_url || '';
        this.nombreEmpresa = empresa.nombre_empresa || '';
        this.horario_meet_morning_start = empresa.horario_meet_morning_start || '';
        this.horario_meet_morning_end = empresa.horario_meet_morning_end || '';
        this.horario_meet_afternoon_start = empresa.horario_meet_afternoon_start || '';
        this.horario_meet_afternoon_end = empresa.horario_meet_afternoon_end || '';
        this.paginaWeb = empresa.web_url || '';
        this.descripcionProductos = empresa.descripcion || '';
        this.empresa_id = empresa.id; // Asignar ID de empresa desde los datos
      } catch (error) {
        console.error('Error al parsear los datos de la empresa:', error);
      }
    } else {
      console.error('No se encontraron datos de la empresa.');
    }
  }



  validarFormulario() {
    // Obtener los IDs desde sessionStorage cada vez que se valida el formulario
    const storedUserId = sessionStorage.getItem('userId');
    const storedEmpresaId = sessionStorage.getItem('empresaId');

    this.usuario_id = storedUserId ? parseInt(storedUserId, 10) : null;
    this.empresa_id = storedEmpresaId ? parseInt(storedEmpresaId, 10) : null;

    // Validar el formulario
    if (!this.enlaceSalaEspera || !this.logotipo ||
      !this.nombreEmpresa || !this.paginaWeb) {
    this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    } else if (!this.usuario_id || !this.empresa_id) {
      this.errorMessage = 'ID de usuario o ID de empresa no disponibles.';
    } else if (!this.horario_meet_morning_start && !this.horario_meet_afternoon_start) {
      this.errorMessage = 'Debe rellenar al menos uno de los campos de horario (mañana o tarde).';  
    } else if (this.contrasena && this.repiteContrasena !== this.contrasena) {
      this.contrasenaErrorMessage = 'Las contraseñas no coinciden.';
    } else {
      this.errorMessage = null;
      this.contrasenaErrorMessage = null;

      const empresa = {
        id: this.empresa_id,
        usuario_id: this.usuario_id,
        nombre_empresa: this.nombreEmpresa,
        web_url: this.paginaWeb,
        spot_url: this.spotPublicitario,
        logo_url: this.logotipo,
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
          this.paginaWeb = response.web_url;
          this.spotPublicitario = response.spot_url;
          this.logotipo = response.logo_url;
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
    if (!this.nuevaContrasena || !this.usuario_id) {
      console.error('Usuario ID y nueva contraseña son obligatorios');
      return;
    }

    const requestBody = {
      usuarioId: this.usuario_id,
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
}