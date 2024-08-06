import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  events = [
    { isExpanded: false, description: 'Lorem ipsum dolor sit amet', details: 'Descripción de este evento de la agenda que tiene que venir de la BBDD' },
    { isExpanded: false, description: 'Lorem ipsum dolor sit amet', details: 'Descripción de este evento de la agenda que tiene que venir de la BBDD' },
    { isExpanded: false, description: 'Lorem ipsum dolor sit amet', details: 'Descripción de este evento de la agenda que tiene que venir de la BBDD' },
    { isExpanded: false, description: 'Lorem ipsum dolor sit amet', details: 'Descripción de este evento de la agenda que tiene que venir de la BBDD' }
  ];

  toggleContent(index: number): void {
    // Cierra todos los eventos
    this.events.forEach((event, i) => {
      if (i !== index) {
        event.isExpanded = false;
      }
    });
    // Alterna el estado del evento clicado
    this.events[index].isExpanded = !this.events[index].isExpanded;
  }
}
