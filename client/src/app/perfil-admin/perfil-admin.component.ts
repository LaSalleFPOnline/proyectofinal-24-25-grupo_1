import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { VotacionService } from '../services/votacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css']
})
export class PerfilAdminComponent implements OnInit {
  empresas: any[] = []; // Array para almacenar los datos de la empresa
  empresaSeleccionada: any = null; // Para almacenar la empresa seleccionada
  horariosDeAtencionManana: string = '';
  horariosDeAtencionTarde: string = '';
  usuariosSinPassword: any[] = [];

  constructor(private empresaService: EmpresaService, private votacionService: VotacionService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.loadEmpresas();
    this.loadEmpresasMasVotadas(); // Carga las empresas más votadas al iniciar el componente
    this.loadUsuariosSinPassword(); // Llama a la nueva función
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

  mostrarDetalles(empresaId: number) {
    this.empresaService.getEmpresaById(empresaId).subscribe(
      (empresa: any) => {
        console.log('Datos de la empresa:', empresa);
        if (empresa) {
          this.empresaSeleccionada = empresa; // Asigna la empresa seleccionada
          // Llama a la función de scroll después de un pequeño retraso
          setTimeout(() => {
            this.scrollToDetalles();
        }, 0);
        } else {
          console.error('Error al mostrar los datos de empresa seleccionada');
        }
      },
      error => {
        console.error('Error al obtener los detalles de la empresa:', error);
      }
    );
  }

  cerrarDetalles() {
    this.empresaSeleccionada = null;
  }

  scrollToDetalles() {
    const detallesElement = document.getElementById('detalles');
    if (detallesElement) {
        detallesElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getEmbedUrl(spot: string): SafeResourceUrl {
    if (spot) {
        const videoId = this.extractVideoId(spot);
        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
        } else {
            console.error('No se pudo extraer el ID de video de la URL:', spot);
        }
    }
    return '';
  }

  extractVideoId(url: string): string | null {
      const longUrlMatch = url.match(/[?&]v=([^&#]*)/);
      if (longUrlMatch) {
          return longUrlMatch[1];
      }
      const shortUrlMatch = url.match(/youtu\.be\/([^&#]*)/);
      if (shortUrlMatch) {
          return shortUrlMatch[1];
      }
      return null;
  }
  loadUsuariosSinPassword(): void {
    this.empresaService.getUsuariosSinPassword().subscribe(
        (usuarios: any[]) => {
            this.usuariosSinPassword = usuarios;
        },
        error => {
            console.error('Error al cargar usuarios sin contraseña:', error);
        }
    );
  }
}