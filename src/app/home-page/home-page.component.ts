/*import { Component } from '@angular/core';
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
    { time: '09:00', description: "Evento 1", details: "Detalles del evento 1", isExpanded: false },
    { time: '11:00', description: "Evento 2", details: "Detalles del evento 2", isExpanded: false },
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
*/
import { Component, OnInit } from '@angular/core';
import { AgendaService } from '../services/agenda.service';

@Component({
  selector: 'app-home-page',

  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  
  events: any[] = []; // Inicializa la lista vacía

  constructor(private agendaService: AgendaService) {}

  ngOnInit() {
    this.loadAgenda(); // Carga los eventos al iniciar el componente
  }

  loadAgenda() {
    this.agendaService.getAgenda().subscribe(
      data => {
        this.events = data.map(event => ({
          hora: event.hora, // Asegúrate de que las propiedades coincidan con lo que tienes en la BBDD
          descripcion: event.descripcion,
          detalles: event.detalles,
          isExpanded: false
        }));
      },
      error => {
        console.error('Error al cargar la agenda:', error);
      }
    );
  }

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
