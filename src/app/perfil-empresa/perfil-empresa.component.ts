import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-perfil-empresa',
  templateUrl: './perfil-empresa.component.html',
  styleUrls: ['./perfil-empresa.component.css']
})
export class PerfilEmpresaComponent {
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

  constructor(private authService: AuthService){};
  validarFormulario() {
    if (!this.nombreColegio || !this.enlaceSalaEspera || !this.logotipo ||
        !this.nombreEmpresa || !this.horariosAtencion || !this.paginaWeb) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    } else {
      this.errorMessage = null;

      const empresa = {
        nombre: this.nombreEmpresa,  // Asume que tienes el ID del usuario de alguna manera
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
              this.successMessage = response.message;
              this.errorMessage = null;
              console.log('Empresa actualizada: ', response);
            },
            error => {
              if (error.status !== 404) {
                  this.errorMessage =  error.error.message;
              }
              this.successMessage = null;
            }
      );
    }
  }
}

