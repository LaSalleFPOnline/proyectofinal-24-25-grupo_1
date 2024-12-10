import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true, // Asegúrate de que esto esté presente
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})
export class PopupComponent {
  isVisible: boolean = false;
  message: string = 'Hola'; // Mensaje por defecto

  openPopup(isVisible: boolean, message: string) {
    this.isVisible = isVisible;
    this.message = message;
  }

  closePopup() {
    this.isVisible = false;
  }
}