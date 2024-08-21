import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  imports: [CommonModule], // Asegúrate de incluir CommonModule aquí
})
export class HomePageComponent {
  
  events = [
    { description: "Evento 1", details: "Detalles del evento 1", isExpanded: false },
    { description: "Evento 2", details: "Detalles del evento 2", isExpanded: false },
    // Otros eventos
  ];

  toggleContent(index: number) {
    this.events[index].isExpanded = !this.events[index].isExpanded;
  }

  downloadFile(filePath: string) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop()!;
    link.click();
  }
}
