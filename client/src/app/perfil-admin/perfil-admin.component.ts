import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { VotacionService } from '../services/votacion.service';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css']
})
export class PerfilAdminComponent implements OnInit {
  empresas: any[] = []; // Array para almacenar los datos de la empresa

  constructor(private empresaService: EmpresaService, private votacionService: VotacionService) { }

  ngOnInit(): void {
    this.loadEmpresas();
    this.loadEmpresasMasVotadas(); // Carga las empresas más votadas al iniciar el componente
  }
  loadEmpresas(): void {
    this.empresaService.getEmpresas().subscribe({
      next: (data: any[]) => {
        this.empresas = data.map(empresa => ({
          ...empresa,
          // Propiedades calculadas para los iconos
          mostrarIconoOK: empresa.nombre_empresa ? true : false, // Mostrar icono OK si tiene nombre de empresa
          mostrarIconoSPOT: empresa.spot ? true : false,  // Mostrar icono SPOT si tiene spot_url
          mostrarIconoFALTAINFO: !empresa.logo // Mostrar icono FALTAINFO si no tiene logo
        }));
  
        console.log('Empresas con propiedades para iconos:', this.empresas);
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
      }
    });
  }
  
  
  
  loadEmpresasMasVotadas() {
    this.votacionService.obtenerVotos().subscribe({
        next: (data: any[]) => {
            this.empresas = data; // Asegúrate de que cada empresa tenga la propiedad 'votos'
            console.log('Empresas con votos:', this.empresas); // Verifica la estructura de datos aquí
        },
        error: (error) => {
            console.error('Error al cargar empresas con votos:', error);
        }
    });
  }
}