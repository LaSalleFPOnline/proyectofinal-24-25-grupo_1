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
  }

  loadEmpresas(): void {
    this.empresaService.getEmpresas().subscribe({
      next: (data: any[]) => {
        this.empresas = data;
        console.log('Empresas:', this.empresas);
        // Verifica que cada empresa tenga un logo_url
        this.empresas.forEach(empresa => console.log('Logo URL:', empresa.logo_url));
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
      }
    });
  }
  
  loadEmpresasMasVotadas(): void {
    this.votacionService.obtenerEmpresasMasVotadas().subscribe({
      next: (data: any[]) => {
        // Suponiendo que 'data' tiene una propiedad 'votos' para ordenar
        this.empresas = data.sort((a, b) => b.votos - a.votos); // Ordenar de mayor a menor por votos
        if (this.empresas.length > 3) {
          this.empresas = this.empresas.slice(0, 3);
        }
        console.log('Empresas más votadas:', this.empresas);
      },
      error: (error) => {
        console.error('Error al cargar empresas más votadas:', error);
      }
    });
  }
  
}