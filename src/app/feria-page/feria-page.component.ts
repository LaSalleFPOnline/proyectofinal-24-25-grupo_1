import { Component, Renderer2, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { EmpresaService } from '../services/empresa.service';

@Component({
  selector: 'app-feria-page',
  standalone: true,
  templateUrl: './feria-page.component.html',
  styleUrls: ['./feria-page.component.css'],
  imports: [CommonModule]  // Incluye CommonModule en imports
})
export class FeriaPageComponent implements OnInit {
  empresas: any[] = [];  // Asegúrate de definir y llenar esta propiedad
  private expandedFrame: HTMLElement | null = null;  // Define la propiedad

  constructor(private renderer: Renderer2, private elRef: ElementRef, private empresaService: EmpresaService) {}

  ngOnInit(): void {
    this.empresaService.getEmpresas().subscribe((data: any[]) => {
      this.empresas = data;
      console.log('Empresas:', this.empresas); // Añade un log para verificar los datos
    }, error => {
      console.error('Error al obtener empresas:', error); // Maneja errores
    });
  }

  toggleFrame(event: Event) {
    const icon = event.target as HTMLImageElement;
    const frame = icon.closest('.rectangle-empresas') as HTMLElement;  // Ajusta el selector a 'rectangle-empresas'

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
}
