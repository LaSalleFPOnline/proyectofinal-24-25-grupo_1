import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { VotacionService } from '../services/votacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil-admin',
  templateUrl: './perfil-admin.component.html',
  styleUrls: ['./perfil-admin.component.css']
})

export class PerfilAdminComponent implements OnInit {

  empresas: any[] = [];
  empresaSeleccionada: any = null;
  horariosDeAtencionManana: string = '';
  horariosDeAtencionTarde: string = '';
  usuariosSinPassword: any[] = [];

  constructor(
    private empresaService: EmpresaService,
    private votacionService: VotacionService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadEmpresas();
      this.loadUsuariosSinPassword();
    } else {
      console.error('Usuario no autenticado');
    }
  }

  loadEmpresas(): void {
    this.empresaService.getEmpresas().subscribe({
      next: (data: any[]) => {
        this.empresas = data.map(empresa => ({
          ...empresa,
          registrada: empresa.registrada ?? false,
          mostrarIconoOK: empresa.nombre_empresa ? true : false,
          mostrarIconoSPOT: empresa.spot ? true : false,
        }));
        console.log('Empresas cargadas:', this.empresas);
        this.saveIconStates();
        this.loadIconStates();
        this.loadEmpresasMasVotadas();
        this.empresasFiltradas = [...this.empresas];
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
      }
    });
  }

  loadIconStates(): void {
    const iconStates = localStorage.getItem('iconStates');
    if (iconStates) {
      const parsedStates = JSON.parse(iconStates);
      this.empresas.forEach(empresa => {
        const state = parsedStates.find((s: any) => s.id === empresa.id_empresa);
        if (state) {
          empresa.mostrarIconoOK = state.mostrarIconoOK;
          empresa.mostrarIconoSPOT = state.mostrarIconoSPOT;
        }
      });
    }
    console.log('Estados de iconos aplicados:', this.empresas);
    this.cdr.detectChanges();
  }

  saveIconStates(): void {
    const iconStates = this.empresas.map(empresa => ({
      id: empresa.id_empresa,
      mostrarIconoOK: empresa.mostrarIconoOK,
      mostrarIconoSPOT: empresa.mostrarIconoSPOT,
    }));
    localStorage.setItem('iconStates', JSON.stringify(iconStates));
    console.log('Estados de iconos guardados:', iconStates);
  }

  mostrarDetalles(empresaId: number) {
    this.empresaService.getEmpresaById(empresaId).subscribe(
      (empresa: any) => {
        console.log('Datos de la empresa:', empresa);
        if (empresa) {
          this.empresaSeleccionada = empresa;
          const horariosManana = `
            Mañana: ${empresa.horario_meet_morning_start} - ${empresa.horario_meet_morning_end}
          `;
          this.horariosDeAtencionManana = horariosManana;
          const horariosTarde = `
            Tarde: ${empresa.horario_meet_afternoon_start} - ${empresa.horario_meet_afternoon_end}
          `;
          this.horariosDeAtencionTarde = horariosTarde;
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
        console.error('No se pudo extraer el ID de video de la URL proporcionada.');
      }
    }
    return '';
  }

  extractVideoId(url: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^&\n]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  }

  loadEmpresasMasVotadas() {
    this.votacionService.obtenerVotos().subscribe({
      next: (data: any[]) => {
        this.empresas.forEach(empresa => {
          const empresaVotada = data.find(votada => votada.id_empresa === empresa.id_empresa);
          if (empresaVotada) {
            empresa.votos = empresaVotada.votos;
          }
        });
        this.empresas.sort((a, b) => b.votos - a.votos);
        console.log('Empresas con votos ordenadas:', this.empresas);
      },
      error: (error) => {
        console.error('Error al cargar empresas con votos:', error);
      }
    });
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

  empresasFiltradas: any[] = [];
  filtroActivo: string = 'registradas';

  filtrarEmpresas(tipo: string): void {
    this.filtroActivo = tipo;
    if (tipo === 'registradas') {
      this.empresasFiltradas = [...this.empresas];
    } else if (tipo === 'sin-registrar') {
      this.empresasFiltradas = this.empresas.filter(empresa => !empresa.registrada);
    } else if (tipo === 'votaciones') {
      this.empresasFiltradas = this.empresas;
    } else if (tipo === 'meets') {
      this.empresasFiltradas = this.empresas.filter(empresa => empresa.url_meet && empresa.url_meet.trim() !== '');
    }
    console.log('Filtro aplicado:', tipo, this.empresasFiltradas);
    this.cdr.detectChanges();
  }

}