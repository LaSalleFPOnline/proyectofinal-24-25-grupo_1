import { Component, Renderer2, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../services/empresa.service';
import { InteresesService } from '../services/intereses.service';
import { AuthService } from '../services/auth.service';
import { AgendaFeriaService } from '../services/agendaFeria.service';
import { VotacionService } from '../services/votacion.service';
import { PopupComponent } from '../popup/popup.component';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-feria-page',
  standalone: true,
  templateUrl: './feria-page.component.html',
  styleUrls: ['./feria-page.component.css'],
  imports: [CommonModule, PopupComponent]
})

export class FeriaPageComponent implements AfterViewInit {
  empresas: any[] = [];
  empresaSeleccionada: any = null;
  relacionesCompra: any[] = [];
  relacionesVenta: any[] = [];
  private expandedFrame: HTMLElement | null = null;
  interesadoEnEmpresa = false;
  yaVotado = false;
  userType: number | null = null;
  ocultarBotonesDeInteraccion = false;
  horariosDeAtencionManana: string = '';
  horariosDeAtencionTarde: string = '';
  spotUrl: string | null = null;
  eventosAgenda: any[] = [];
  now: Date = new Date();
  logoUrl: string = '';
  @ViewChild('popupComponent') popupComponent!: PopupComponent;

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private elRef: ElementRef,
    private empresaService: EmpresaService,
    private interesesService: InteresesService,
    private authService: AuthService,
    private agendaFeriaService: AgendaFeriaService,
    private votacionService: VotacionService
  ) {}

  ngOnInit(): void {
    this.cargarRelacionesDesdeStorage();
    setInterval(() => this.actualizarEstadoEventos(), 60000);
    this.authService.getUserRole().subscribe({
      next: (role: number | null) => {
        this.userType = role;
        if (this.userType === 1 || this.userType === 2 || this.userType === 3) {
          this.empresaService.getEmpresas().subscribe({
            next: (data: any[]) => {
              this.empresas = data.map(empresa => ({
                ...empresa,
                logoUrl: `${empresa.logo}`
              }));
              console.log('Empresas: ', this.empresas);
              this.actualizarVotaciones();
              this.cdr.detectChanges();
              const empresaId = this.authService.getLoggedInCompanyId();
              if (empresaId !== null) {
                this.obtenerRelaciones(empresaId);
                this.cargarEventosAgenda();
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

  ngAfterViewInit(): void {
    const popupMessage = localStorage.getItem('popupMessage');
    if (popupMessage) {
      // Llama a openPopup con ambos argumentos
      this.popupComponent.openPopup(true, popupMessage); // true para hacer visible el popup
      localStorage.removeItem('popupMessage'); // Limpiar el mensaje después de mostrarlo
    }
  }
  // Nueva función para cargar eventos
  cargarEventosAgenda(): void {
    this.agendaFeriaService.getEventFechasAgendaFeria().subscribe({
      next: (evento: any) => {  // Aquí evento ya es un objeto, no un array
        console.log('Eventos de la agenda:', evento);
  
        // Si la respuesta es un objeto único, puedes directamente acceder a sus propiedades
        this.eventosAgenda = [{
          ...evento,
          fechaInicio: new Date(evento.fechaEvento_inicio),
          fechaFin: new Date(evento.fechaEvento_fin),
        }];
        
        console.log('Datos cargados en eventosAgenda:', this.eventosAgenda);
  
        // Filtrar los eventos
        this.filtrarEventosAgenda();
      },
      error: (error) => {
        console.error('Error al obtener los eventos de la agenda:', error);
      }
    });
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

  obtenerRelaciones(empresaId: number): void {
    console.log('Ejecutando obtenerRelaciones con empresaId:', empresaId);
    this.interesesService.obtenerRelaciones(empresaId).subscribe((data: any) => {
      console.log('Datos obtenidos del servicio:', data);
      this.relacionesCompra = data.compras || [];
      this.relacionesVenta = data.ventas || [];
      const loggedInCompanyId = this.authService.getLoggedInCompanyId();
      this.interesadoEnEmpresa = this.relacionesVenta.some(rel =>
        rel.id_empresaCompradora === loggedInCompanyId &&
        rel.id_empresaVendedora === empresaId
      );
      this.assignLogosToRelations(this.relacionesCompra, 'compra');
      this.assignLogosToRelations(this.relacionesVenta, 'venta');
      console.log('Relaciones de compra:', this.relacionesCompra);
      console.log('Relaciones de venta:', this.relacionesVenta);
      this.saveRelationsToSessionStorage(this.relacionesCompra, 'relacionesCompra');
      this.saveRelationsToSessionStorage(this.relacionesVenta, 'relacionesVenta');
      this.filtrarEventosAgenda(); // Filtrar eventos de la agenda
      this.cdr.detectChanges(); // Forzar la detección de cambios
    }, error => {
      console.error('Error al obtener relaciones:', error);
    });
  }

  private assignLogosToRelations(relations: any[], relationType: 'compra' | 'venta'): void {
    console.log('Relaciones a procesar:', relations);
    console.log('Empresas disponibles:', this.empresas);
    const idField = relationType === 'compra' ? 'id_empresaVendedora' : 'id_empresaCompradora';
    relations.forEach(rel => {
      console.log('Procesando relación:', rel, 'con ID:', rel[idField]);
      if (!rel[idField]) {
        console.error('Campo ID indefinido en la relación:', rel);
        return;
      }
      const empresa = this.empresas.find(e => e.id_empresa === rel[idField]);
      if (empresa) {
        console.log('Asignando logo:', empresa.logo, 'a relación:', rel);
        rel.logo = empresa.logo;
        rel.nombre_empresa = empresa.nombre_empresa;
        rel.horario_meet_morning_start = empresa.horario_meet_morning_start || '';
        rel.horario_meet_morning_end = empresa.horario_meet_morning_end || '';
        rel.horario_meet_afternoon_start = empresa.horario_meet_afternoon_start || '';
        rel.horario_meet_afternoon_end = empresa.horario_meet_afternoon_end || '';
        rel.meet_url = empresa.url_meet || '';
      } else {
        console.error('Empresa no encontrada para ID:', rel[idField]);
      }
    });
  }

  private saveRelationsToSessionStorage(relations: any[], key: string): void {
    const relacionesConDetalles = relations.map((rel: any) => ({
      ...rel,
      meet_url: rel.meet_url || '',
      horarios: rel.horarios || []
    }));
    sessionStorage.setItem(key, JSON.stringify(relacionesConDetalles));
    console.log('Relaciones de compra guardadas en sessionStorage:', sessionStorage.getItem('relacionesCompra'));
    console.log('Relaciones de venta guardadas en sessionStorage:', sessionStorage.getItem('relacionesVenta'));
    console.log(`${key} guardadas en sessionStorage.`);
  }

  // toggleFrame(event: Event) {
  //   const icon = event.target as HTMLImageElement;
  //   const frame = icon.closest('.frame') as HTMLElement;
  //   if (!frame) return;
  //   if (this.expandedFrame && this.expandedFrame !== frame) {
  //     this.renderer.removeClass(this.expandedFrame, 'expanded');
  //     this.renderer.addClass(this.expandedFrame, 'collapsed');
  //   }
  //   if (frame.classList.contains('expanded')) {
  //     this.renderer.removeClass(frame, 'expanded');
  //     this.renderer.addClass(frame, 'collapsed');
  //     this.expandedFrame = null;
  //   } else {
  //     this.renderer.removeClass(frame, 'collapsed');
  //     this.renderer.addClass(frame, 'expanded');
  //     this.expandedFrame = frame;
  //   }
  // }

  toggleFrame(event: Event, evento: any) {
    const icon = event.target as HTMLImageElement;
    const frame = icon.closest('.frame') as HTMLElement;
    if (!frame) return;
  
    // Cierra el frame anterior si estaba abierto
    if (this.expandedFrame && this.expandedFrame !== frame) {
      this.renderer.removeClass(this.expandedFrame, 'expanded');
      this.renderer.addClass(this.expandedFrame, 'collapsed');
      
      // BUSCA qué 'eventoAnterior' era y márcalo como isExpanded = false
      // (Si estás guardando su índice o tienes forma de identificarlo).
    }
  
    // Si este frame ya está expandido, lo cerramos
    if (frame.classList.contains('expanded')) {
      this.renderer.removeClass(frame, 'expanded');
      this.renderer.addClass(frame, 'collapsed');
      this.expandedFrame = null;
      
      // AQUÍ lo marcamos como colapsado
      evento.isExpanded = false;
  
    } else {
      this.renderer.removeClass(frame, 'collapsed');
      this.renderer.addClass(frame, 'expanded');
      this.expandedFrame = frame;
  
      // AQUÍ lo marcamos como expandido
      evento.isExpanded = true;
    }
  }
  mostrarDetalles(empresaId: any) {
    console.log(this.relacionesVenta[0]);
    console.log('ID de la empresa seleccionada:', empresaId);
    if (empresaId && typeof empresaId === 'number') {
      this.empresaService.getEmpresaById(empresaId).subscribe(
            (empresa: any) => {
                console.log('Datos de la empresa:', empresa);
                if (empresa) {
                  this.empresaSeleccionada = empresa;
                  this.spotUrl = empresa.spot || null; // Asigna el spotUrl aquí
                  console.log('Spot URL:', this.spotUrl);
                  console.log(this.empresaSeleccionada);
                  console.log('ID de Empresa Selecciona:', this.empresaSeleccionada.id_empresa);
                } else {
                  console.error('Error al mostrar los datos de empresa seleccionada');
                }
                const horariosManana = `
                    Mañana: ${empresa.horario_meet_morning_start} - ${empresa.horario_meet_morning_end}
                `;
                this.horariosDeAtencionManana = horariosManana;
                const horariosTarde = `
                    Tarde: ${empresa.horario_meet_afternoon_start} - ${empresa.horario_meet_afternoon_end}
                `;
                this.horariosDeAtencionTarde = horariosTarde;
                this.spotUrl = empresa.spot || null;

                const empresaSeleccionada = this.empresas.find(emp => emp.id_empresa === empresaId);
                if (empresaSeleccionada) {
                  this.empresaSeleccionada = empresaSeleccionada;
                  const loggedInCompanyId = this.authService.getLoggedInCompanyId();
                  this.interesadoEnEmpresa = this.relacionesVenta.some(rel =>
                    rel.id_empresaVendedora === loggedInCompanyId &&
                    rel.id_empresaCompradora === empresaId
                  );
                  this.cdr.detectChanges();
                }
                const loggedInCompanyId = this.authService.getLoggedInCompanyId();
                const loggedInUserId = this.authService.getUserId();
                this.interesadoEnEmpresa = this.relacionesCompra.some(rel =>
                  rel.id_empresaVendedora === empresaId &&
                  rel.id_empresaCompradora === loggedInCompanyId
                );
                if (loggedInUserId !== null) {
                    this.votacionService.verificarVoto(loggedInUserId, empresaId).subscribe(
                        (yaVotado: boolean) => {
                            this.yaVotado = yaVotado;
                            console.log(`Estado del voto para la empresa ${empresaId}:`, this.yaVotado);
                            localStorage.setItem(`voto_${empresaId}`, JSON.stringify(this.yaVotado));
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
    const empresaInteresadaId = this.empresaSeleccionada?.id_empresa;
    if (!empresaId || !empresaInteresadaId) {
        console.error('IDs de las empresas no proporcionados.');
        return;
    }
    const esEmpresaEnRelacionesVenta = this.relacionesVenta.some(rel => 
        rel.id_empresaVendedora === empresaId &&
        rel.id_empresaCompradora === empresaInteresadaId
    );
    if (esEmpresaEnRelacionesVenta) {
        this.interesesService.eliminarInteres({ id_empresaVendedora: empresaId, id_empresaCompradora: empresaInteresadaId })
            .subscribe({
                next: () => {
                    console.log('Interés eliminado exitosamente');
                    this.interesadoEnEmpresa = false;
                    this.obtenerRelaciones(empresaId);
                },
                error: err => console.error('Error al eliminar interés:', err),
                complete: () => this.cdr.detectChanges()
            });
    } else {
        this.interesesService.crearInteres(empresaId, empresaInteresadaId)
            .subscribe({
                next: () => {
                    console.log('Interés agregado exitosamente');
                    this.interesadoEnEmpresa = true;
                    this.obtenerRelaciones(empresaId);
                },
                error: err => console.error('Error al agregar interés:', err),
                complete: () => this.cdr.detectChanges()
            });
    }
}

  isInteresadoEnEmpresa(): boolean {
    const loggedInCompanyId = this.authService.getLoggedInCompanyId();
    return this.relacionesVenta.some(rel =>
        rel.id_empresaVendedora === loggedInCompanyId &&
        rel.id_empresaCompradora === this.empresaSeleccionada?.id_empresa
    );
}

votar(): void {
  const usuarioId = this.authService.getUserId();
  const empresaVotadaId = this.empresaSeleccionada?.id_empresa;
  const voto = 1;

  console.log('Intentando votar...'); // Agregado para depuración

  if (usuarioId === null || empresaVotadaId === null) {
      console.error('IDs de las empresas no proporcionados.');
      return;
  }

  this.votacionService.obtenerFechasVotacion().subscribe(fechas => {
      console.log('Fechas de votación:', fechas); // Agregado para depuración
      if (fechas.length === 0) {
          console.error('No se recibieron fechas de votación.');
          return;
      }
      const fechaVotacion = fechas[0];
      const fechaInicio = new Date(fechaVotacion.fechaVotacion_inicio);
      const fechaFin = new Date(fechaVotacion.fechaVotacion_fin);
      const ahora = new Date();
      console.log('Fecha actual:', ahora);
      console.log('Fecha de inicio de votación:', fechaInicio);
      console.log('Fecha de fin de votación:', fechaFin);
      if (ahora < fechaInicio || ahora > fechaFin) {
          console.log('Mostrando pop-up por fuera del periodo de votación');
          this.popupComponent.openPopup(true, `El periodo de votaciones es desde ${fechaInicio.toLocaleDateString()} hasta ${fechaFin.toLocaleDateString()}.`, 'error');
          return;
      }
      this.votacionService.votar(usuarioId, empresaVotadaId, voto).pipe(
          catchError(error => {
              console.error('Error al votar:', error);
              // Aquí manejamos el error y mostramos el popup
              this.popupComponent.openPopup(true, "Solamente puedes votar a 1 empresa. Elimina el voto y vuelve a intentarlo", 'error');
              return of(null);
          })
      ).subscribe(response => {
          if (response) {
              console.log('Voto registrado exitosamente:', response);
              this.yaVotado = true; // Asegúrate de que esto se ejecute
              localStorage.setItem(`voto_${empresaVotadaId}`, JSON.stringify(this.yaVotado));
              this.popupComponent.openPopup(true, "Has registrado tu voto correctamente", 'success'); // Mensaje de éxito
          }
      });
  }, error => {
      console.error('Error al obtener las fechas de votación:', error);
  });
}

eliminarVoto(): void {
  const usuarioId = this.authService.getUserId();
  const empresaVotadaId = this.empresaSeleccionada?.id_empresa;
  if (usuarioId === null || empresaVotadaId === null) {
      console.error('IDs de las empresas no proporcionados.');
      return;
  }
  this.votacionService.obtenerFechasVotacion().subscribe(fechas => {
      if (fechas.length === 0) {
          console.error('No se recibieron fechas de votación.');
          return;
      }
      const fechaVotacion = fechas[0];
      const fechaInicio = new Date(fechaVotacion.fechaVotacion_inicio);
      const fechaFin = new Date(fechaVotacion.fechaVotacion_fin);
      const ahora = new Date();
      if (ahora < fechaInicio || ahora > fechaFin) {
          this.popupComponent.openPopup(true, `El periodo de votaciones es desde ${fechaInicio.toLocaleDateString()} hasta ${fechaFin.toLocaleDateString()}.`, 'error');
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
              localStorage.removeItem(`voto_${empresaVotadaId}`);
              this.popupComponent.openPopup(true, "Has eliminado tu voto correctamente", 'success');
          }
      });
  }, error => {
      console.error('Error al obtener las fechas de votación:', error);
  });
}

  haVotadoPorEmpresa(empresaId: number): boolean {
    return localStorage.getItem(`voto_${empresaId}`) === 'true';
  }

  actualizarVotaciones(): void {
    const loggedInUserId = this.authService.getUserId();
    if (loggedInUserId !== null) {
      this.empresas.forEach((empresa) => {
        this.votacionService.verificarVoto(loggedInUserId, empresa.id_empresa).subscribe(
          (yaVotado: boolean) => {
            empresa.votado = yaVotado;
            localStorage.setItem(`voto_${empresa.id_empresa}`, JSON.stringify(yaVotado)); // Guardar en localStorage
          },
          (error) => {
            console.error('Error al verificar el voto:', error);
          }
        );
      });
    }
  }

  cargarRelacionesDesdeStorage() {
    const relacionesCompra = JSON.parse(sessionStorage.getItem('relacionesCompra') || '[]');
    const relacionesVenta = JSON.parse(sessionStorage.getItem('relacionesVenta') || '[]');
    this.relacionesCompra = relacionesCompra;
    this.relacionesVenta = relacionesVenta;
    this.filtrarEventosAgenda();
}

/*filtrarEventosAgenda() {
  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);
  const currentDate = this.now.toISOString().split('T')[0];
  const eventosUnicos = new Set();
  this.eventosAgenda = [];
  allEventos.forEach(rel => {
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
          const horarioStart = new Date(`${currentDate}T${rel.horario_meet_morning_start}`);
          const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_morning_end}`);
          const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
          const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
          if (!eventosUnicos.has(eventoId)) {
              this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
              eventosUnicos.add(eventoId);
          }
      }
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
          const horarioStart = new Date(`${currentDate}T${rel.horario_meet_afternoon_start}`);
          const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_afternoon_end}`);
          const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
          const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
          if (!eventosUnicos.has(eventoId)) {
              this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
              eventosUnicos.add(eventoId); // Agregar el evento al conjunto
          }
      }
  });
  this.eventosAgenda = this.eventosAgenda.filter(evento => evento.horario_end > this.now)
    .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());
  console.log('Eventos de la agenda filtrados y únicos:', this.eventosAgenda);
  this.cdr.detectChanges();
}*/
/*filtrarEventosAgenda(): void {
  console.log('Datos iniciales de eventosAgenda:', this.eventosAgenda);

  if (!this.eventosAgenda || this.eventosAgenda.length === 0) {
    console.log('No hay eventos en eventosAgenda. No se realiza filtrado.');
    return; // Salimos si no hay eventos cargados
  }

  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);

  const eventosUnicos = new Set();
  const eventosFiltrados: any[] = []; // Lista temporal para los eventos filtrados

  // Iterar sobre cada relación para generar los horarios en base a eventosAgenda
  allEventos.forEach(rel => {
    this.eventosAgenda.forEach(eventoAgenda => {
      const currentDate = eventoAgenda.fechaInicio.toISOString().split('T')[0];

      // Eventos de mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
        const horarioStart = new Date(`${currentDate}T${rel.horario_meet_morning_start}`);
        const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_morning_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;

        if (!eventosUnicos.has(eventoId)) {
          eventosFiltrados.push({
            nombre: rel.nombre_empresa,
            meet_url: rel.meet_url,
            horario_start: horarioStart,
            horario_end: horarioEnd,
            enCurso,
          });
          eventosUnicos.add(eventoId);
        }
      }

      // Eventos de tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
        const horarioStart = new Date(`${currentDate}T${rel.horario_meet_afternoon_start}`);
        const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_afternoon_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;

        if (!eventosUnicos.has(eventoId)) {
          eventosFiltrados.push({
            nombre: rel.nombre_empresa,
            meet_url: rel.meet_url,
            horario_start: horarioStart,
            horario_end: horarioEnd,
            enCurso,
          });
          eventosUnicos.add(eventoId);
        }
      }
    });
  });

  // Actualizar eventosAgenda con los filtrados
  this.eventosAgenda = eventosFiltrados
    .filter(evento => evento.horario_end > this.now)
    .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());

  console.log('Eventos de la agenda filtrados y únicos:', this.eventosAgenda);

  // Forzar que Angular detecte los cambios, incluso si no se ha producido una actualización en la vista
  this.cdr.markForCheck();
}
*/
/*filtrarEventosAgenda() {
  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);

  // Verificar si existe una fecha clave en eventosAgenda
  if (!this.eventosAgenda || this.eventosAgenda.length === 0) {
    console.warn('No hay eventosAgenda cargada con fechas clave.');
    return;
  }

  const fechaInicio = new Date(this.eventosAgenda[0].fechaEvento_inicio);
  const fechaFin = new Date(this.eventosAgenda[0].fechaEvento_fin);

  const eventosUnicos = new Set();
  this.eventosAgenda = [];

  // Iterar sobre cada evento y procesarlo únicamente dentro del rango de fechas clave
  allEventos.forEach(rel => {
    // Procesar solo las fechas clave (fechaInicio a fechaFin)
    const currentDate = new Date(fechaInicio); // Comienza desde la fecha de inicio
    while (currentDate <= fechaFin) {
      const formattedDate = currentDate.toISOString().split('T')[0];

      // Procesar horarios de la mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
        const horarioStart = new Date(`${formattedDate}T${rel.horario_meet_morning_start}`);
        const horarioEnd = new Date(`${formattedDate}T${rel.horario_meet_morning_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
        if (!eventosUnicos.has(eventoId)) {
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
          eventosUnicos.add(eventoId);
        }
      }

      // Procesar horarios de la tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
        const horarioStart = new Date(`${formattedDate}T${rel.horario_meet_afternoon_start}`);
        const horarioEnd = new Date(`${formattedDate}T${rel.horario_meet_afternoon_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
        if (!eventosUnicos.has(eventoId)) {
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
          eventosUnicos.add(eventoId);
        }
      }

      // No avanzar más allá de la fecha clave
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Filtrar eventos futuros y ordenar
  this.eventosAgenda = this.eventosAgenda.filter(evento => evento.horario_end > this.now)
    .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());

  console.log('Eventos de la agenda filtrados y únicos para la fecha clave:', this.eventosAgenda);
  this.cdr.detectChanges();
}*/
/*filtrarEventosAgenda() {
  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);

  // Verificar si existe una fecha clave en eventosAgenda
  if (!this.eventosAgenda || this.eventosAgenda.length === 0) {
    console.warn('No hay eventosAgenda cargada con fechas clave.');

    // Mostrar todos los eventos sin tratamiento
    allEventos.forEach(rel => {
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
        const horarioStart = new Date(`${this.now.toISOString().split('T')[0]}T${rel.horario_meet_morning_start}`);
        const horarioEnd = new Date(`${this.now.toISOString().split('T')[0]}T${rel.horario_meet_morning_end}`);
        this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, false);
      }
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
        const horarioStart = new Date(`${this.now.toISOString().split('T')[0]}T${rel.horario_meet_afternoon_start}`);
        const horarioEnd = new Date(`${this.now.toISOString().split('T')[0]}T${rel.horario_meet_afternoon_end}`);
        this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, false);
      }
    });

    console.log('Mostrando eventos sin tratamiento:', this.eventosAgenda);
    this.cdr.detectChanges();
    return;
  }

  // Si existe una fecha clave, filtrar los eventos según esa fecha
  const fechaInicio = new Date(this.eventosAgenda[0].fechaEvento_inicio);
  const fechaFin = new Date(this.eventosAgenda[0].fechaEvento_fin);
  const eventosUnicos = new Set();

  const currentDate = new Date(fechaInicio); // Comienza desde la fecha de inicio
  while (currentDate <= fechaFin) {
    const formattedDate = currentDate.toISOString().split('T')[0];

    allEventos.forEach(rel => {
      // Procesar horarios de la mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
        const horarioStart = new Date(`${formattedDate}T${rel.horario_meet_morning_start}`);
        const horarioEnd = new Date(`${formattedDate}T${rel.horario_meet_morning_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
        if (!eventosUnicos.has(eventoId)) {
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
          eventosUnicos.add(eventoId);
        }
      }

      // Procesar horarios de la tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
        const horarioStart = new Date(`${formattedDate}T${rel.horario_meet_afternoon_start}`);
        const horarioEnd = new Date(`${formattedDate}T${rel.horario_meet_afternoon_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
        if (!eventosUnicos.has(eventoId)) {
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
          eventosUnicos.add(eventoId);
        }
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Filtrar eventos futuros y ordenar
  this.eventosAgenda = this.eventosAgenda.filter(evento => evento.horario_end > this.now)
    .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());

  console.log('Eventos de la agenda filtrados y únicos para la fecha clave:', this.eventosAgenda);
  this.cdr.detectChanges();
}*/
filtrarEventosAgenda() {
  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);

  // Verificar si existe una fecha clave en eventosAgenda
  if (!this.eventosAgenda || this.eventosAgenda.length === 0) {
    console.warn('No hay eventosAgenda cargada con fechas clave.');

    // Mostrar todos los eventos sin tratamiento
    const empresasVistas = new Set();  // Set para controlar empresas fuera de fechas clave
    allEventos.forEach(rel => {
      // Verificamos si el evento está fuera de las fechas clave
      const fechaEvento = this.now.toISOString().split('T')[0];

      // Procesar horarios de la mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
        if (!empresasVistas.has(`${rel.nombre_empresa}-morning`)) {  // Aseguramos que solo se agregue una vez por empresa-mañana
          const horarioStart = new Date(`${fechaEvento}T${rel.horario_meet_morning_start}`);
          const horarioEnd = new Date(`${fechaEvento}T${rel.horario_meet_morning_end}`);
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, false);
          empresasVistas.add(`${rel.nombre_empresa}-morning`);  // Añadimos al set para no repetir en la mañana
        }
      }

      // Procesar horarios de la tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
        if (!empresasVistas.has(`${rel.nombre_empresa}-afternoon`)) {  // Aseguramos que solo se agregue una vez por empresa-tarde
          const horarioStart = new Date(`${fechaEvento}T${rel.horario_meet_afternoon_start}`);
          const horarioEnd = new Date(`${fechaEvento}T${rel.horario_meet_afternoon_end}`);
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, false);
          empresasVistas.add(`${rel.nombre_empresa}-afternoon`);  // Añadimos al set para no repetir en la tarde
        }
      }
    });

    console.log('Mostrando eventos sin tratamiento:', this.eventosAgenda);
    this.cdr.detectChanges();
    return;
  }

  // Si existe una fecha clave, filtrar los eventos según esa fecha
  const fechaInicio = new Date(this.eventosAgenda[0].fechaEvento_inicio);
  const fechaFin = new Date(this.eventosAgenda[0].fechaEvento_fin);
  const eventosUnicos = new Set();

  const currentDate = new Date(fechaInicio); // Comienza desde la fecha de inicio
  while (currentDate <= fechaFin) {
    const formattedDate = currentDate.toISOString().split('T')[0];

    allEventos.forEach(rel => {
      // Procesar horarios de la mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
        const horarioStart = new Date(`${formattedDate}T${rel.horario_meet_morning_start}`);
        const horarioEnd = new Date(`${formattedDate}T${rel.horario_meet_morning_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
        if (!eventosUnicos.has(eventoId)) {
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
          eventosUnicos.add(eventoId);
        }
      }

      // Procesar horarios de la tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
        const horarioStart = new Date(`${formattedDate}T${rel.horario_meet_afternoon_start}`);
        const horarioEnd = new Date(`${formattedDate}T${rel.horario_meet_afternoon_end}`);
        const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
        const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
        if (!eventosUnicos.has(eventoId)) {
          this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
          eventosUnicos.add(eventoId);
        }
      }
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Filtrar eventos futuros y ordenar
  this.eventosAgenda = this.eventosAgenda.filter(evento => evento.horario_end > this.now)
    .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());

  console.log('Eventos de la agenda filtrados y únicos para la fecha clave:', this.eventosAgenda);
  this.cdr.detectChanges();
}


agregarEvento(nombre: string, meetUrl: string, horarioStart: Date, horarioEnd: Date, enCurso: boolean) {
  const eventoExistente = this.eventosAgenda.some(evento =>
      evento.nombre === nombre &&
      evento.horario_start.getTime() === horarioStart.getTime() &&
      evento.horario_end.getTime() === horarioEnd.getTime() &&
      enCurso
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

esEventoEnCurso(inicio: Date, fin: Date): boolean {
  const ahora = new Date();
  return ahora >= inicio && ahora <= fin;
}

  actualizarEstadoEventos(): void {
    this.now = new Date();
    this.filtrarEventosAgenda();
    this.cdr.detectChanges();
  }

  openMeetLink(meetUrl: string) {
    // Abre el enlace en una nueva pestaña
    window.open(meetUrl, '_blank');
  }

  toggleEvento(evento: any) {
    evento.expandido = !evento.expandido;
  }

  filtroActivo: string = 'todas'; // Filtro inicial
  mostrarTodasEmpresas: boolean = true;
  mostrarInteresadasEnMi: boolean = false;
  mostrarMisInteresesEmpresas: boolean = false;
  empresasVotadas: any[] = [];
  // mostrarMiVoto: boolean = false;
  

  mostrarTodas(): void {
    this.filtroActivo = 'todas';
    this.mostrarTodasEmpresas = true;
    this.mostrarInteresadasEnMi = false;
    this.mostrarMisInteresesEmpresas = false;
  }
  
  mostrarInteresadas(): void {
    this.filtroActivo = 'interesadas';
    this.mostrarTodasEmpresas = false;
    this.mostrarInteresadasEnMi = true;
    this.mostrarMisInteresesEmpresas = false;

    const empresaId = this.authService.getLoggedInCompanyId();
    if (empresaId) {
        this.obtenerRelaciones(empresaId); // Carga las relaciones
        this.relacionesCompra.forEach(rel => {
            const empresa = this.empresas.find(e => e.id_empresa === rel.id_empresaVendedora);
            if (empresa) {
                rel.spotDisponible = !!empresa.spot; // Determina si tiene spot disponible
                rel.yaVotado = this.haVotadoPorEmpresa(empresa.id_empresa); // Comprueba si ya votó
            }
        });
        this.cdr.detectChanges(); // Refresca la vista para mostrar los cambios
    } else {
        console.error('No se pudo obtener el ID de la empresa logueada.');
    }
}
  
  mostrarMisIntereses(): void {
    this.filtroActivo = 'misIntereses';
    this.mostrarTodasEmpresas = false;
    this.mostrarInteresadasEnMi = false;
    this.mostrarMisInteresesEmpresas = true;

      const empresaId = this.authService.getLoggedInCompanyId();
    if (empresaId) {
        this.obtenerRelaciones(empresaId); // Carga las relaciones
        this.relacionesCompra.forEach(rel => {
            const empresa = this.empresas.find(e => e.id_empresa === rel.id_empresaVendedora);
            if (empresa) {
                rel.spotDisponible = !!empresa.spot; // Determina si tiene spot disponible
                rel.yaVotado = this.haVotadoPorEmpresa(empresa.id_empresa); // Comprueba si ya votó
            }
        });
        this.cdr.detectChanges(); // Refresca la vista para mostrar los cambios
    } else {
        console.error('No se pudo obtener el ID de la empresa logueada.');
    }
  }
  mostrarMiVoto(): void {
    this.filtroActivo = 'miVoto';
    this.mostrarTodasEmpresas = false;
    this.mostrarInteresadasEnMi = false;
    this.mostrarMisInteresesEmpresas = false;
    // this.mostrarMiVoto = true;

    // Filtrar empresas votadas
    const loggedInUserId = this.authService.getUserId();
    if (loggedInUserId) {
        this.empresasVotadas = this.empresas.filter(empresa =>
            this.haVotadoPorEmpresa(empresa.id_empresa)
        );
    } else {
        console.error('Usuario no autenticado. No se puede filtrar empresas votadas.');
    }
}
}
