import { Component, OnInit } from '@angular/core';
import { AgendaService } from '../services/agenda.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})

export class HomePageComponent implements OnInit {

  events: any[] = [];
  fechaEvento_inicio!: Date;
  fechaEvento_fin!: Date;
  lastUpdatedDate: string | null = null;

  constructor(private agendaService: AgendaService) {}

  ngOnInit() {
    this.loadAgendaWithDates();
    setInterval(() => {
      this.checkAndLoadAgenda();
    }, 60 * 60 * 1000);
  }

  loadAgendaWithDates() {
    this.agendaService.getAgenda().subscribe(
      data => {
        if (data.length > 0) {
          this.fechaEvento_inicio = new Date(data[0].fechaEvento_inicio);
          this.fechaEvento_fin = new Date(data[0].fechaEvento_fin);
        }
        this.checkAndLoadAgenda(data);
      },
      error => {
        console.error('Error al cargar la agenda:', error);
      }
    );
  }

  checkAndLoadAgenda(data?: any[]) {
    const today = new Date();
    if (this.fechaEvento_inicio && this.fechaEvento_fin) {
      if (
        today >= this.fechaEvento_inicio &&
        today <= this.fechaEvento_fin
      ) {
        const todayString = today.toISOString().split('T')[0];
        if (this.lastUpdatedDate !== todayString) {
          console.log('Dentro del rango, cargando agenda...');
          this.processEvents(data || []);
          this.lastUpdatedDate = todayString;
        }
      } else {
        console.log('Fuera del rango, mostrando toda la agenda.');
      this.events = (data || []).map(event => ({
        hora: event.horaI ? event.horaI.substring(0, 5) : '',
        horaFinal: event.horaF ? event.horaF.substring(0, 5) : '',
        descripcion: event.descripcion || '',
        detalles: event.detalles || '',
        isExpanded: false,
        isCurrent: false,
      }));
      }
    }
  }

  processEvents(data: any[]) {
    console.log('Datos recibidos:', data);
    this.events = data.map(event => {
      return {
        hora: event.horaI.substring(0, 5),
        horaFinal: event.horaF.substring(0, 5),
        descripcion: event.descripcion,
        detalles: event.detalles,
        isExpanded: false,
        isCurrent: this.isEventCurrent(event.horaI, event.horaF)
      };
    })
    .filter(event => !this.isEventPast(event.horaFinal));
    this.events.sort((a, b) => {
      const aMinutes = this.timeToMinutes(a.hora);
      const bMinutes = this.timeToMinutes(b.hora);
      return aMinutes - bMinutes;
    });
    console.log('Eventos procesados y ordenados:', this.events);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  private isEventCurrent(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const eventStart = new Date(`${currentDate}T${startTime}`);
    const eventEnd = new Date(`${currentDate}T${endTime}`);
    return now >= eventStart && now <= eventEnd;
  }

  private isEventPast(endTime: string): boolean {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
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