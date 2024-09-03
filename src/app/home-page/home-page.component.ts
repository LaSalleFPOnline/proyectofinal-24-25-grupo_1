
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
        console.log('Datos recibidos:', data); // Verifica los datos recibidos

        // Procesa los eventos
        this.events = data.map(event => {
          return {
            hora: event.horaI.substring(0, 5),
            horaFinal: event.horaF.substring(0, 5),
            descripcion: event.descripcion,
            detalles: event.detalles,
            isExpanded: false,
            isCurrent: this.isEventCurrent(event.horaI, event.horaF) // Marca el evento como actual si es necesario
          };
        })
        .filter(event => !this.isEventPast(event.horaFinal)); // Filtra eventos pasados

        // Ordena los eventos de más cercano a más lejano
        this.events.sort((a, b) => {
          const aMinutes = this.timeToMinutes(a.hora);
          const bMinutes = this.timeToMinutes(b.hora);
          return aMinutes - bMinutes;
        });

        // Verifica los eventos después de ordenar
        console.log('Eventos procesados y ordenados:', this.events);
      },
      error => {
        console.error('Error al cargar la agenda:', error);
      }
    );
  }

  // Función para convertir una hora en formato HH:MM a minutos
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  // Función para determinar si un evento está ocurriendo ahora
  private isEventCurrent(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    const eventStart = new Date(`${currentDate}T${startTime}`);
    const eventEnd = new Date(`${currentDate}T${endTime}`);

    return now >= eventStart && now <= eventEnd;
  }

  // Función para determinar si un evento ha pasado
  private isEventPast(endTime: string): boolean {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    const eventEnd = new Date(`${currentDate}T${endTime}`);

    return now > eventEnd;
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
