import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { VotacionService } from '../services/votacion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar AuthService

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

  constructor(
    private empresaService: EmpresaService,
    private votacionService: VotacionService,
    private authService: AuthService, // Asegúrate de importar AuthService
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef // Inyecta ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) { // Asegúrate de que el usuario esté autenticado
        this.loadEmpresas(); // Cargar empresas al iniciar
        this.loadUsuariosSinPassword();
    } else {
        console.error('Usuario no autenticado');
        // Redirigir a la página de inicio de sesión o mostrar un mensaje
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
            this.saveIconStates(); // Guarda los estados de los iconos después de cargar las empresas
            this.loadIconStates(); // Carga los estados de los iconos
            this.loadEmpresasMasVotadas(); // Carga los votos después de cargar las empresas
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
    console.log('Estados de iconos aplicados:', this.empresas); // Verifica que los estados se apliquen correctamente
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  saveIconStates(): void {
    const iconStates = this.empresas.map(empresa => ({
      id: empresa.id_empresa,
      mostrarIconoOK: empresa.mostrarIconoOK,
      mostrarIconoSPOT: empresa.mostrarIconoSPOT,
    }));
    localStorage.setItem('iconStates', JSON.stringify(iconStates)); // Guarda en localStorage
    console.log('Estados de iconos guardados:', iconStates); // Verifica que se guarden correctamente
  }

  mostrarDetalles(empresaId: number) {
    this.empresaService.getEmpresaById(empresaId).subscribe(
      (empresa: any) => {
        console.log('Datos de la empresa:', empresa);
        if (empresa) {
          this.empresaSeleccionada = empresa; // Asigna la empresa seleccionada
          // Asegúrate de construir los horarios de atención aquí
          const horariosManana = `
              Mañana: ${empresa.horario_meet_morning_start} - ${empresa.horario_meet_morning_end}
          `;
          this.horariosDeAtencionManana = horariosManana; // Asignar a una propiedad si es necesario

          const horariosTarde = `
              Tarde: ${empresa.horario_meet_afternoon_start} - ${empresa.horario_meet_afternoon_end}
          `;
          this.horariosDeAtencionTarde = horariosTarde;
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
                    empresa.votos = empresaVotada.votos; // Asigna el número de votos
                }
            });
            this.empresas.sort((a, b) => b.votos - a.votos);
            console.log('Empresas con votos ordenadas:', this.empresas);
        },
        error: (error) => {
            console.error('Error al cargar empresas con votos:', error);
            // Manejo de errores
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
  filtroActivo: string = 'registradas'; // Filtro activo por defecto
  

  // Método para filtrar empresas
  filtrarEmpresas(tipo: string): void {
    this.filtroActivo = tipo; // Actualiza el filtro activo
    
    if (tipo === 'registradas') {
      this.empresasFiltradas = [...this.empresas]; // Filtra registradas
    } else if (tipo === 'sin-registrar') {
      this.empresasFiltradas = this.empresas.filter(empresa => !empresa.registrada); // Filtra sin registrar
    } else if (tipo === 'votaciones') {
      this.empresasFiltradas = this.empresas; // Suponiendo que las votaciones usan el mismo array
    } else if (tipo === 'meets') {
      this.empresasFiltradas = this.empresas.filter(empresa => empresa.url_meet && empresa.url_meet.trim() !== '');
    }
  
    console.log('Filtro aplicado:', tipo, this.empresasFiltradas); // Depuración
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }
}
