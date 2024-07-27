import { Component } from '@angular/core';

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

  validarFormulario() {
    if (!this.nombreColegio || !this.enlaceSalaEspera || !this.logotipo ||
        !this.nombreEmpresa || !this.horariosAtencion || !this.paginaWeb) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios.';
    } else {
      this.errorMessage = null;
      // Lógica adicional para el formulario válido
    }
  }
}
