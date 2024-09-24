import { Component, Renderer2, ElementRef, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../services/empresa.service';
import { InteresesService } from '../services/intereses.service';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar el AuthService
import { VotacionService } from '../services/votacion.service'; // Importa el nuevo servicio
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-feria-page',
  standalone: true,
  templateUrl: './feria-page.component.html',
  styleUrls: ['./feria-page.component.css'],
  imports: [CommonModule]
})

export class FeriaPageComponent implements OnInit {
  empresas: any[] = [];
  empresaSeleccionada: any = null;
  relacionesCompra: any[] = [];
  relacionesVenta: any[] = [];
  private expandedFrame: HTMLElement | null = null;
  interesadoEnEmpresa = false;
  yaVotado = false; // Variable para verificar si ya se ha votado
  userType: number | null = null; // Variable para guardar el tipo de usuario SANTI
  ocultarBotonesDeInteraccion = false; // Variable para controlar la visibilidad de los botones
  horariosDeAtencionManana: string = ''; // Inicializar con un valor vacío
  horariosDeAtencionTarde: string = ''; // Inicializar con un valor vacío
  spotUrl: string | null = null;  // Declara la propiedad spotUrl
  eventosAgenda: any[] = [];
  now: Date = new Date();

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef, // Inyecta ChangeDetectorRef
    private sanitizer: DomSanitizer, // Inyecta DomSanitizer aquí

    private elRef: ElementRef,
    private empresaService: EmpresaService,
    private interesesService: InteresesService,
    private authService: AuthService, // Asegúrate de inyectar AuthService
    private votacionService: VotacionService // Inyecta el servicio de votación
  ) {}

  ngOnInit(): void { //SANTI
    this.cargarRelacionesDesdeStorage();
    setInterval(() => this.actualizarEstadoEventos(), 60000);
    
    this.authService.getUserRole().subscribe({
      next: (role: number | null) => {
        this.userType = role;
        // Obtener empresas y relaciones solo si el usuario está logueado y tiene un rol válido
        if (this.userType === 1 || this.userType === 2) {
          this.empresaService.getEmpresas().subscribe({
            next: (data: any[]) => {
              this.empresas = data;
              console.log('Empresas: ', this.empresas);
  
              const empresaId = this.authService.getLoggedInCompanyId();
  
              if (empresaId !== null) {
                this.obtenerRelaciones(empresaId);
              } else {
                console.error('No se pudo obtener el ID de la empresa logueada.');
              }
            },
            error: (error) => {
              console.error('Error al obtener empresas: ', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener rol del usuario: ', error);
      }
    });
  }

  getEmbedUrl(spotUrl: string): SafeResourceUrl {
    if (spotUrl) {
      const videoId = this.extractVideoId(spotUrl);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      } else {
        console.error('No se pudo extraer el ID de video de la URL:', spotUrl);
      }
    }
    return '';
  }
  
  

  extractVideoId(url: string): string | null {
    // Para URLs largas
    const longUrlMatch = url.match(/[?&]v=([^&#]*)/);
    if (longUrlMatch) {
      return longUrlMatch[1];
    }
    
    // Para URLs cortas
    const shortUrlMatch = url.match(/youtu\.be\/([^&#]*)/);
    if (shortUrlMatch) {
      return shortUrlMatch[1];
    }
  
    return null;
  }

  obtenerRelaciones(empresaId: number): void {
    this.interesesService.obtenerRelaciones(empresaId).subscribe((data: any) => {
      console.log('Datos obtenidos de relaciones:', data);
      this.relacionesCompra = data.compras || [];
      this.relacionesVenta = data.ventas || [];
      
      // Asignar logotipos y detalles de agenda para cada tipo de relación
      this.assignLogosToRelations(this.relacionesCompra, 'empresa_id');
      this.assignLogosToRelations(this.relacionesVenta, 'empresa_interesada_id');
      
      console.log('Relaciones de compra:', this.relacionesCompra);
      console.log('Relaciones de venta:', this.relacionesVenta);
  
      // Guardar relaciones en sessionStorage
      this.saveRelationsToSessionStorage(this.relacionesCompra, 'relacionesCompra');
      this.saveRelationsToSessionStorage(this.relacionesVenta, 'relacionesVenta');
      this.filtrarEventosAgenda(); // Filtrar eventos de la agenda
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, error => {
      console.error('Error al obtener relaciones:', error);
    });
  }
  

  private assignLogosToRelations(relations: any[], idField: 'empresa_id' | 'empresa_interesada_id'): void {
    relations.forEach(rel => {
      // Buscar la empresa correspondiente usando el campo ID especificado
      const empresa = this.empresas.find(e => e.id === rel[idField]);
      if (empresa) {
        rel.logo_url = empresa.logo_url;
        rel.nombre_empresa = empresa.nombre_empresa;
  
        // Añadir detalles de la agenda
        rel.horario_meet_morning_start = empresa.horario_meet_morning_start || '';
        rel.horario_meet_morning_end = empresa.horario_meet_morning_end || '';
        rel.horario_meet_afternoon_start = empresa.horario_meet_afternoon_start || '';
        rel.horario_meet_afternoon_end = empresa.horario_meet_afternoon_end || '';
        rel.meet_url = empresa.url_meet || '';
      }
    });
  }
  

  private saveRelationsToSessionStorage(relations: any[], key: string): void {
    // Añadir URL del meet y horarios a cada relación
    const relacionesConDetalles = relations.map((rel: any) => ({
      ...rel,
      meet_url: rel.meet_url || '', // Asegúrate de tener la URL del meet en tus datos
      horarios: rel.horarios || []   // Asegúrate de tener los horarios en tus datos
    }));

    sessionStorage.setItem(key, JSON.stringify(relacionesConDetalles));
    console.log('Relaciones de compra guardadas en sessionStorage:', sessionStorage.getItem('relacionesCompra'));
    console.log('Relaciones de venta guardadas en sessionStorage:', sessionStorage.getItem('relacionesVenta'));
    console.log(`${key} guardadas en sessionStorage.`);
  }

  toggleFrame(event: Event) {
    const icon = event.target as HTMLImageElement;
    const frame = icon.closest('.frame') as HTMLElement;

    if (!frame) return;

    // Collapse currently expanded frame
    if (this.expandedFrame && this.expandedFrame !== frame) {
      this.renderer.removeClass(this.expandedFrame, 'expanded');
      this.renderer.addClass(this.expandedFrame, 'collapsed');
    }

    // Toggle the clicked frame
    if (frame.classList.contains('expanded')) {
      this.renderer.removeClass(frame, 'expanded');
      this.renderer.addClass(frame, 'collapsed');
      this.expandedFrame = null;
    } else {
      this.renderer.removeClass(frame, 'collapsed');
      this.renderer.addClass(frame, 'expanded');
      this.expandedFrame = frame;
    }
  }

  mostrarDetalles(empresaId: any) {
    if (typeof empresaId === 'number') {
        this.empresaService.getEmpresaById(empresaId).subscribe(
            (empresa: any) => {
                console.log('Datos de la empresa:', empresa);
                this.empresaSeleccionada = empresa;

                // Construye los horarios de atención a partir de las propiedades individuales
                const horariosManana = `
                    Mañana: ${empresa.horario_meet_morning_start} - ${empresa.horario_meet_morning_end}
                `;
                this.horariosDeAtencionManana = horariosManana; // Asignar a una propiedad si es necesario
                
                const horariosTarde = `
                    Tarde: ${empresa.horario_meet_afternoon_start} - ${empresa.horario_meet_afternoon_end}
                `;
                this.horariosDeAtencionTarde = horariosTarde;

                // Asigna el spot si está disponible
                this.spotUrl = empresa.spot_url || null;  // Añade esta línea

                this.interesadoEnEmpresa = this.relacionesVenta.some(rel => rel.empresa_interesada_id === empresaId);
                
                const loggedInCompanyId = this.authService.getLoggedInCompanyId();
                if (loggedInCompanyId !== null) {
                    this.votacionService.verificarVoto(loggedInCompanyId, empresaId).subscribe(
                        (yaVotado: boolean) => {
                            this.yaVotado = yaVotado;
                            console.log('Estado del voto:', this.yaVotado);
                        },
                        error => {
                            console.error('Error al verificar el voto:', error);
                            this.yaVotado = false;
                        }
                    );
                }

                if (empresaId === loggedInCompanyId) {
                    console.log('Es la empresa del usuario logueado, ocultando botones');
                    this.ocultarBotonesDeInteraccion = true;
                } else {
                    this.ocultarBotonesDeInteraccion = false;
                }

                this.cdr.detectChanges();

                // Hacer scroll hacia los detalles de la empresa
                const detallesElement = document.getElementById('detalles');
                if (detallesElement) {
                    detallesElement.scrollIntoView({ behavior: 'smooth' });
                }
            },
            error => {
                console.error('Error al obtener los detalles de la empresa:', error);
            }
        );
    } else {
        console.error('ID de la empresa no es un número:', empresaId);
    }
}



  cerrarDetalles() {
    this.empresaSeleccionada = null;
  }

  agregarOEliminarInteres() {
    const empresaId = this.authService.getLoggedInCompanyId();
    const empresaInteresadaId = this.empresaSeleccionada?.id;

    if (empresaId === null || empresaInteresadaId === null) {
        console.error('IDs de las empresas no proporcionados.');
        return;
    }

    if (this.interesadoEnEmpresa) {
        this.interesesService.eliminarInteres({ empresaId, empresaInteresadaId }).subscribe(
            response => {
                console.log('Interés eliminado exitosamente', response);
                this.interesadoEnEmpresa = false;
                // Actualiza la lista de relaciones
                this.obtenerRelaciones(empresaId);
                this.filtrarEventosAgenda(); // Actualiza la agenda
                this.cdr.detectChanges(); // Forzar detección de cambios
            },
            error => {
                console.error('Error al eliminar interés:', error);
            }
        );
    } else {
        this.interesesService.crearInteres(empresaId, empresaInteresadaId).subscribe(
            response => {
                console.log('Interés agregado exitosamente', response);
                this.interesadoEnEmpresa = true;
                // Actualiza la lista de relaciones
                this.obtenerRelaciones(empresaId);
                this.filtrarEventosAgenda(); // Actualiza la agenda
                this.cdr.detectChanges(); // Forzar detección de cambios
            },
            error => {
                console.error('Error al agregar interés:', error);
            }
        );
    }
  }
  
  votar(): void {
    const usuarioId = this.authService.getLoggedInCompanyId();
    const empresaVotadaId = this.empresaSeleccionada?.id;
    const voto = 1; // Aquí defines el valor del voto, puede ser un valor positivo o negativo según tu lógica

    if (usuarioId === null || empresaVotadaId === null) {
      console.error('IDs de las empresas no proporcionados.');
      return;
    }

    this.votacionService.votar(usuarioId, empresaVotadaId, voto).pipe(
      catchError(error => {
        console.error('Error al votar:', error);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        console.log('Voto registrado exitosamente:', response);
        this.yaVotado = true;
      }
    });
  }

  eliminarVoto(): void {
    const usuarioId = this.authService.getLoggedInCompanyId();
    const empresaVotadaId = this.empresaSeleccionada?.id;
  
    if (usuarioId === null || empresaVotadaId === null) {
      console.error('IDs de las empresas no proporcionados.');
      return;
    }
  
    this.votacionService.eliminarVoto(usuarioId, empresaVotadaId).pipe(
      catchError(error => {
        console.error('Error al eliminar voto:', error);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        console.log('Voto eliminado exitosamente', response);
        this.yaVotado = false;
      }
    });
  }

  cargarRelacionesDesdeStorage() {
    const relacionesCompra = JSON.parse(sessionStorage.getItem('relacionesCompra') || '[]');
    const relacionesVenta = JSON.parse(sessionStorage.getItem('relacionesVenta') || '[]');

    if (!relacionesCompra.length) {
        console.warn('No se encontraron relaciones de compra en sessionStorage.');
    }

    if (!relacionesVenta.length) {
        console.warn('No se encontraron relaciones de venta en sessionStorage.');
    }

    this.relacionesCompra = relacionesCompra;
    this.relacionesVenta = relacionesVenta;

    this.filtrarEventosAgenda();
}



filtrarEventosAgenda() {
  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);

  const currentDate = this.now.toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD

  this.eventosAgenda = [];

  allEventos.forEach(rel => {
      // Crear evento de la mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
          const horarioStart = new Date(`${currentDate}T${rel.horario_meet_morning_start}`);
          const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_morning_end}`);

          const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
      }

      // Crear evento de la tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
          const horarioStart = new Date(`${currentDate}T${rel.horario_meet_afternoon_start}`);
          const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_afternoon_end}`);

          const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
      }
  });

  // Filtrar eventos que no han pasado y ordenar por horario de inicio
  this.eventosAgenda = this.eventosAgenda.filter(evento => evento.horario_end > this.now)
      .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());

  console.log('Eventos de la agenda filtrados:', this.eventosAgenda);
}

// Método para agregar evento sin duplicados
agregarEvento(nombre: string, meetUrl: string, horarioStart: Date, horarioEnd: Date, enCurso: boolean) {
  const eventoExistente = this.eventosAgenda.some(evento => 
      evento.nombre === nombre && 
      evento.horario_start.getTime() === horarioStart.getTime() && 
      evento.horario_end.getTime() === horarioEnd.getTime() &&
      enCurso // Añadir si el evento está en curso o no
  );

  if (!eventoExistente) {
      this.eventosAgenda.push({
          nombre: nombre,
          meet_url: meetUrl,
          horario_start: horarioStart,
          horario_end: horarioEnd,
          estado: 'pendiente',
          enCurso
      });
  }
}

// Verifica si un evento está ocurriendo actualmente
esEventoEnCurso(inicio: Date, fin: Date): boolean {
  const ahora = new Date();
  return ahora >= inicio && ahora <= fin;
}

  actualizarEstadoEventos(): void {
    this.now = new Date();
    this.filtrarEventosAgenda();
    this.cdr.detectChanges();
  }

  // Método para abrir el enlace de Meet
  openMeetLink(meetUrl: string) {
    // Abre el enlace en una nueva pestaña
    window.open(meetUrl, '_blank');
  }

  toggleEvento(evento: any) {
    evento.expandido = !evento.expandido;
  }
  
}