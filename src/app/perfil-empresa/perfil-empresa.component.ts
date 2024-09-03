import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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
  // horariosAtencion: string = '';
  horariosAtencionInicio: string = ''; // Nueva propiedad para la hora de inicio
  horariosAtencionFin: string = ''; // Nueva propiedad para la hora de fin
  paginaWeb: string = '';
  descripcionProductos: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  usuario_id: number | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getUser().subscribe(user => {
      if (user) {
        this.usuario_id = user.id;
      }
    });

    this.authService.getEmpresa().subscribe((empresa: any) => {
      if (empresa) {
        this.nombreColegio = empresa.entidad || '';
        this.enlaceSalaEspera = empresa.url_meet || '';
        this.logotipo = empresa.logo_url || '';
        this.spotPublicitario = empresa.spot_url || '';
        this.nombreEmpresa = empresa.nombre_empresa || '';
        // this.horariosAtencion = empresa.horario_meet || '';
        this.horariosAtencionInicio = empresa.horarios_atencion_inicio || ''; // Adaptado
        this.horariosAtencionFin = empresa.horarios_atencion_fin || '';
        this.paginaWeb = empresa.web_url || '';
        this.descripcionProductos = empresa.descripcion || '';
      } else {
        console.error('No se encontraron datos de la empresa.');
      }
    });
  }

  validarFormulario() {
    if (!this.nombreColegio || !this.enlaceSalaEspera || !this.logotipo ||
        !this.nombreEmpresa || !this.paginaWeb) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    } else {
      this.errorMessage = null;
// TODO !this.horariosAtencion  ACTUALIZAR O DE MAÑANA O DE TARDE, PERO UNO AL MENOS!! PENSAR SI EN EL FRONT SÓLO COMO checkPassword
      const empresa = {
        usuario_id: this.usuario_id,
        nombre_empresa: this.nombreEmpresa,
        web_url: this.paginaWeb,
        spot_url: this.spotPublicitario,
        logo_url: this.logotipo,
        descripcion: this.descripcionProductos,
        url_meet: this.enlaceSalaEspera,
        // horario_meet: this.horariosAtencion,
        horarios_atencion_inicio: this.horariosAtencionInicio, // Adaptado
        horarios_atencion_fin: this.horariosAtencionFin, // Adaptado
        entidad: this.nombreColegio
      };

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
          // this.horariosAtencion = response.horario_meet;
          this.horariosAtencionInicio = response.horarios_atencion_inicio; // Adaptado
          this.horariosAtencionFin = response.horarios_atencion_fin; // Adaptado

          this.nombreColegio = response.entidad;
      
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
}