import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css'
})

export class PopupComponent {

  isVisible: boolean = false;
  message: string = '';
  backgroundColor: string = '';

  openPopup(isVisible: boolean, message: string, type: 'success' | 'error' = 'success') {
    this.isVisible = isVisible;
    this.message = message;
    this.backgroundColor = type === 'success' ? '#60A96E' : '#AC3635';
  }

  closePopup() {
    this.isVisible = false;
  }

}