import { Component, Renderer2, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EmpresaService } from '../services/empresa.service';
import { InteresesService } from '../services/intereses.service';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar el AuthService

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

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private empresaService: EmpresaService,
    private interesesService: InteresesService,
    private authService: AuthService // Asegúrate de inyectar AuthService
  ) {}

  ngOnInit(): void {
    this.empresaService.getEmpresas().subscribe((data: any[]) => {
      this.empresas = data;
      console.log('Empresas: ', this.empresas);
    }, error => {
      console.error('Error al obtener empresas: ', error);
    });

    const empresaId = this.authService.getLoggedInCompanyId(); 

    if (empresaId !== null) {
      this.interesesService.obtenerRelaciones(empresaId).subscribe((data: any) => {
        this.relacionesCompra = data.compras || [];
        this.relacionesVenta = data.ventas || [];
        console.log('Relaciones de compra:', this.relacionesCompra);
        console.log('Relaciones de venta:', this.relacionesVenta);
      }, error => {
        console.error('Error al obtener relaciones:', error);
      });
    } else {
      console.error('No se pudo obtener el ID de la empresa logueada.');
    }
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

  mostrarDetalles(empresa: any) {
    this.empresaSeleccionada = empresa;
    this.authService.setEmpresaSeleccionada(empresa); // Usa el servicio para guardar la empresa seleccionada
    console.log('Empresa seleccionada:', empresa);
  }

  cerrarDetalles() {
    this.empresaSeleccionada = null;
  }

  agregarInteres() {
    const empresaId = this.authService.getLoggedInCompanyId();
    const empresaInteresadaId = this.authService.getEmpresaSeleccionadaId();

    if (empresaId === null || empresaInteresadaId === null) {
      console.error('IDs de las empresas no proporcionados.');
      console.log('Empresa ID:', empresaId);
      console.log('Empresa Seleccionada ID:', empresaInteresadaId);
      return;
    }

    const body = {
      empresa_id: empresaId,
      empresa_interesada_id: empresaInteresadaId
    };

    this.http.post('/api/intereses', body)
      .subscribe(
        response => {
          console.log('Interés agregado exitosamente', response);
        },
        error => {
          console.error('Error al agregar interés:', error);
        }
      );
  }
}
