import { Component, Renderer2, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../services/empresa.service';
import { InteresesService } from '../services/intereses.service';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar el AuthService
import { VotacionService } from '../services/votacion.service'; // Importa el nuevo servicio
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';


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

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private empresaService: EmpresaService,
    private interesesService: InteresesService,
    private authService: AuthService, // Asegúrate de inyectar AuthService
    private votacionService: VotacionService // Inyecta el servicio de votación
  ) {}

  ngOnInit(): void { //SANTI
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

  obtenerRelaciones(empresaId: number): void {
    this.interesesService.obtenerRelaciones(empresaId).subscribe((data: any) => {
        this.relacionesCompra = data.compras || [];
        this.relacionesVenta = data.ventas || [];
        
        // Asignar logotipos correctamente para cada tipo de relación
        this.assignLogosToRelations(this.relacionesCompra, 'empresa_id');
        this.assignLogosToRelations(this.relacionesVenta, 'empresa_interesada_id');
        
        console.log('Relaciones de compra:', this.relacionesCompra);
        console.log('Relaciones de venta:', this.relacionesVenta);
    }, error => {
        console.error('Error al obtener relaciones:', error);
    });
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
              },
              error => {
                  console.error('Error al agregar interés:', error);
              }
          );
      }
  }

  private assignLogosToRelations(relations: any[], idField: 'empresa_id' | 'empresa_interesada_id'): void {
    relations.forEach(rel => {
        // Buscar la empresa correspondiente usando el campo ID especificado
        const empresa = this.empresas.find(e => e.id === rel[idField]);
        if (empresa) {
            rel.logo_url = empresa.logo_url;
            rel.nombre_empresa = empresa.nombre_empresa;
        }
    });
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
      if (response && response.message) {
        console.log('Voto registrado exitosamente', response);
        this.yaVotado = true;
      } else if (response && response.error) {
        console.error('Error al votar:', response.error);
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
}

