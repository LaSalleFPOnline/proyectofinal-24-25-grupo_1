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
        if (this.userType === 1 || this.userType === 2 || this.userType === 3) {
          this.empresaService.getEmpresas().subscribe({
            next: (data: any[]) => {
              this.empresas = data;
              console.log('Empresas: ', this.empresas);

              this.actualizarVotaciones();

              // Forzamos la actualización de la vista
              this.cdr.detectChanges();  // Aquí forzamos la detección de cambios

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
    console.log('Ejecutando obtenerRelaciones con empresaId:', empresaId);
    this.interesesService.obtenerRelaciones(empresaId).subscribe((data: any) => {
      console.log('Datos obtenidos del servicio:', data);
      this.relacionesCompra = data.compras || [];
      this.relacionesVenta = data.ventas || [];

      // Aquí actualizas el estado de interesadoEnEmpresa después de obtener las relaciones
      const loggedInCompanyId = this.authService.getLoggedInCompanyId();
      this.interesadoEnEmpresa = this.relacionesVenta.some(rel => 
        rel.id_empresaCompradora === loggedInCompanyId && 
        rel.id_empresaVendedora === empresaId
      );

      // Asignar logotipos y detalles de agenda para cada tipo de relación
      this.assignLogosToRelations(this.relacionesCompra, 'compra');
      this.assignLogosToRelations(this.relacionesVenta, 'venta');


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


  private assignLogosToRelations(relations: any[], relationType: 'compra' | 'venta'): void {
    console.log('Relaciones a procesar:', relations);
    console.log('Empresas disponibles:', this.empresas);
  
    const idField = relationType === 'compra' ? 'id_empresaVendedora' : 'id_empresaCompradora';
  
    relations.forEach(rel => {
      console.log('Procesando relación:', rel, 'con ID:', rel[idField]);
  
      // Validar que el campo ID esté definido
      if (!rel[idField]) {
        console.error('Campo ID indefinido en la relación:', rel);
        return;
      }
  
      // Buscar la empresa correspondiente
      const empresa = this.empresas.find(e => e.id_empresa === rel[idField]);
      if (empresa) {
        console.log('Asignando logo:', empresa.logo, 'a relación:', rel);
        rel.logo = empresa.logo;
        rel.nombre_empresa = empresa.nombre_empresa;
  
        // Añadir detalles de la agenda
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
    console.log(this.relacionesVenta[0]);
    console.log('ID de la empresa seleccionada:', empresaId); // Asegúrate de que se pase el ID correcto
    if (empresaId && typeof empresaId === 'number') { // Verificación adicional
      this.empresaService.getEmpresaById(empresaId).subscribe(
            (empresa: any) => {
                console.log('Datos de la empresa:', empresa);
                if (empresa) {
                  this.empresaSeleccionada = empresa;
                  console.log(this.empresaSeleccionada);
                  console.log('ID de Empresa Selecciona:', this.empresaSeleccionada.id_empresa);

                } else {
                  console.error('Error al mostrar los datos de empresa seleccionada');
                }
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
                this.spotUrl = empresa.spot || null;  // Añade esta línea

                const empresaSeleccionada = this.empresas.find(emp => emp.id_empresa === empresaId);
                if (empresaSeleccionada) {
                  this.empresaSeleccionada = empresaSeleccionada;
                  const loggedInCompanyId = this.authService.getLoggedInCompanyId();

                  // Filtra únicamente las relaciones donde mi empresa (loggedInCompanyId) es la compradora
                  this.interesadoEnEmpresa = this.relacionesVenta.some(rel => 
                    rel.id_empresaCompradora === loggedInCompanyId && 
                    rel.id_empresaVendedora === empresaId
                  );


                  // Actualizar vista después de asignar valores
                  this.cdr.detectChanges();
                }
                const loggedInCompanyId = this.authService.getLoggedInCompanyId();
                const loggedInUserId = this.authService.getUserId(); // Obtén el ID del usuario logueado
                // Verificar si la empresa seleccionada ya está en los intereses
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
    const empresaId = this.authService.getLoggedInCompanyId(); // ID de la empresa actual
    const empresaInteresadaId = this.empresaSeleccionada?.id_empresa; // ID de la empresa seleccionada
  
    if (!empresaId || !empresaInteresadaId) {
      console.error('IDs de las empresas no proporcionados.');
      return;
    }
  
    // Verificar si la empresa está en las relaciones de compra o venta
    const esEmpresaEnRelacionesCompra = this.relacionesCompra.some(rel => 
      rel.id_empresaVendedora === empresaInteresadaId && rel.id_empresaCompradora === empresaId
    );
    const esEmpresaEnRelacionesVenta = this.relacionesVenta.some(rel => 
      rel.id_empresaVendedora === empresaId && rel.id_empresaCompradora === empresaInteresadaId
    );
  
    if (esEmpresaEnRelacionesVenta) {
      // Si la empresa está en las relaciones de venta, cambiar el botón a "Eliminar interés"
      if (this.interesadoEnEmpresa) {
        // Eliminar interés
        this.interesesService.eliminarInteres({ id_empresaCompradora: empresaId, id_empresaVendedora: empresaInteresadaId })
          .subscribe({
              next: () => {
                console.log('Interés eliminado exitosamente');
                this.interesadoEnEmpresa = false;
                this.obtenerRelaciones(empresaId); // Actualiza las relaciones
              },
              error: err => console.error('Error al eliminar interés:', err),
              complete: () => this.cdr.detectChanges() // Actualiza la vista
          });
      } else {
        // Si no está interesado, agregar el interés
        this.interesesService.crearInteres(empresaId, empresaInteresadaId)
          .subscribe({
            next: () => {
              console.log('Interés agregado exitosamente');
              this.interesadoEnEmpresa = true;
              this.obtenerRelaciones(empresaId); // Actualiza las relaciones
            },
            error: err => console.error('Error al agregar interés:', err),
            complete: () => this.cdr.detectChanges() // Actualiza la vista
          });
      }
    } else if (esEmpresaEnRelacionesCompra) {
      // Si la empresa está en las relaciones de compra, cambia el botón a "Eliminar interés"
      console.log("Eliminar interés en compra");
      if (this.interesadoEnEmpresa) {
        // Eliminar interés
        this.interesesService.eliminarInteres({ id_empresaCompradora: empresaId, id_empresaVendedora: empresaInteresadaId })
          .subscribe({
              next: () => {
                console.log('Interés eliminado exitosamente');
                this.interesadoEnEmpresa = false;
                this.obtenerRelaciones(empresaId); // Actualiza las relaciones
              },
              error: err => console.error('Error al eliminar interés:', err),
              complete: () => this.cdr.detectChanges() // Actualiza la vista
          });
      } else {
        // Si no está interesado, agregar el interés
        this.interesesService.crearInteres(empresaId, empresaInteresadaId)
          .subscribe({
            next: () => {
              console.log('Interés agregado exitosamente');
              this.interesadoEnEmpresa = true;
              this.obtenerRelaciones(empresaId); // Actualiza las relaciones
            },
            error: err => console.error('Error al agregar interés:', err),
            complete: () => this.cdr.detectChanges() // Actualiza la vista
          });
      }
    }
  }
  
  

  votar(): void {
    const usuarioId = this.authService.getUserId();
    const empresaVotadaId = this.empresaSeleccionada?.id_empresa;
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
        localStorage.setItem(`voto_${empresaVotadaId}`, JSON.stringify(this.yaVotado));
      }
    });
  }

  eliminarVoto(): void {
    const usuarioId = this.authService.getUserId();
    const empresaVotadaId = this.empresaSeleccionada?.id_empresa;

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
        localStorage.removeItem(`voto_${empresaVotadaId}`);
      }
    });
  }

  // Método para verificar si el usuario ha votado por la empresa
  haVotadoPorEmpresa(empresaId: number): boolean {
    return localStorage.getItem(`voto_${empresaId}`) === 'true';  // Devuelve true si ha votado
  }

  actualizarVotaciones(): void {
    const loggedInUserId = this.authService.getUserId(); // Obtener el ID del usuario logueado
  
    if (loggedInUserId !== null) {
      this.empresas.forEach((empresa) => {
        this.votacionService.verificarVoto(loggedInUserId, empresa.id_empresa).subscribe(
          (yaVotado: boolean) => {
            empresa.votado = yaVotado; // Guardamos el estado del voto directamente en la empresa
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

filtrarEventosAgenda() {
  const allEventos = [...this.relacionesCompra, ...this.relacionesVenta];
  console.log('Todas las relaciones combinadas:', allEventos);

  const currentDate = this.now.toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
  const eventosUnicos = new Set(); // Usar un Set para almacenar eventos únicos

  this.eventosAgenda = []; // Reiniciar eventosAgenda

  allEventos.forEach(rel => {
      // Crear evento de la mañana
      if (rel.horario_meet_morning_start && rel.horario_meet_morning_end) {
          const horarioStart = new Date(`${currentDate}T${rel.horario_meet_morning_start}`);
          const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_morning_end}`);

          const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
          
          // Usar un identificador único para el evento
          const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
          
          // Agregar evento solo si no existe ya en el conjunto
          if (!eventosUnicos.has(eventoId)) {
              this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
              eventosUnicos.add(eventoId); // Agregar el evento al conjunto
          }
      }

      // Crear evento de la tarde
      if (rel.horario_meet_afternoon_start && rel.horario_meet_afternoon_end) {
          const horarioStart = new Date(`${currentDate}T${rel.horario_meet_afternoon_start}`);
          const horarioEnd = new Date(`${currentDate}T${rel.horario_meet_afternoon_end}`);

          const enCurso = this.esEventoEnCurso(horarioStart, horarioEnd);
          
          // Usar un identificador único para el evento
          const eventoId = `${rel.nombre_empresa}-${horarioStart.toISOString()}-${horarioEnd.toISOString()}`;
          
          // Agregar evento solo si no existe ya en el conjunto
          if (!eventosUnicos.has(eventoId)) {
              this.agregarEvento(rel.nombre_empresa, rel.meet_url, horarioStart, horarioEnd, enCurso);
              eventosUnicos.add(eventoId); // Agregar el evento al conjunto
          }
      }
  });

  // Filtrar eventos que no han pasado y ordenar por horario de inicio
  this.eventosAgenda = this.eventosAgenda.filter(evento => evento.horario_end > this.now)
    .sort((a, b) => a.horario_start.getTime() - b.horario_start.getTime());
  
  console.log('Eventos de la agenda filtrados y únicos:', this.eventosAgenda);
  this.cdr.detectChanges(); // Forzar la detección de cambios para actualizar la vista.
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
