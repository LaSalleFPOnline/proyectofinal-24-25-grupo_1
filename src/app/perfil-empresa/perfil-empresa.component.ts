import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; // Importa Router

@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
})
export class PerfilEmpresaComponent implements OnInit {
  nombreColegio: string = '';
  enlaceSalaEspera: string = '';
  logotipo: string = '';
  spotPublicitario: string = '';
  nombreEmpresa: string = '';
  horariosAtencion: string = '';
  paginaWeb: string = '';
  descripcionProductos: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  usuario_id: number | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.authService.getUser();
    const empresa = this.authService.getEmpresa();

    if (user && empresa) {
      this.usuario_id = user.id; // Guarda el usuario_id para usarlo en la actualización
      this.nombreColegio = empresa.entidad || '';
      this.enlaceSalaEspera = empresa.url_meet || '';
      this.logotipo = empresa.logo_url || '';
      this.spotPublicitario = empresa.spot_url || '';
      this.nombreEmpresa = user.nombre || '';
      this.horariosAtencion = empresa.horario_meet || '';
      this.paginaWeb = empresa.web_url || '';
      this.descripcionProductos = empresa.descripcion || '';
    } else {
      console.error('No se encontraron datos de la empresa o del usuario.');
    }
  }

  validarFormulario() {
    if (!this.nombreColegio || !this.enlaceSalaEspera || !this.logotipo ||
        !this.nombreEmpresa || !this.horariosAtencion || !this.paginaWeb) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    } else {
      this.errorMessage = null;

      const empresa = {
        usuario_id: this.usuario_id, // Usa el usuario_id almacenado
        nombre: this.nombreEmpresa,
        web_url: this.paginaWeb,
        spot_url: this.spotPublicitario,
        logo_url: this.logotipo,
        descripcion: this.descripcionProductos,
        url_meet: this.enlaceSalaEspera,
        horario_meet: this.horariosAtencion,
        entidad: this.nombreColegio
      };

      this.authService.actualizarEmpresa(empresa).subscribe(
        response => {
          console.log('Datos actualizados:', response);
          this.successMessage = 'Datos de la empresa actualizados correctamente.';
          this.errorMessage = null;

          // Actualiza los campos con los datos recibidos después de la actualización
          this.nombreEmpresa = response.nombreEmpresa;
          this.paginaWeb = response.web_url;
          this.spotPublicitario = response.spot_url;
          this.logotipo = response.logo_url;
          this.descripcionProductos = response.descripcion;
          this.enlaceSalaEspera = response.url_meet;
          this.horariosAtencion = response.horario_meet;
          this.nombreColegio = response.entidad;
          // Redirige a FeriaPageComponent
          this.router.navigate(['/feria']);
        },
        error => {
          console.error('Error al actualizar la empresa:', error);
          this.errorMessage = 'Hubo un error al actualizar la empresa. Por favor, inténtelo de nuevo.';
          this.successMessage = null;
        }
      );
    }
  }
}

