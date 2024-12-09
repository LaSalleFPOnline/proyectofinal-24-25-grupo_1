import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  // Método para abrir la nueva pestaña con un servicio de correo en línea (como Gmail)
  sendMail(): void {
    const email = 'LSBM@lasalle.es';
    const subject = ''; // Asunto del correo
    const body = ''; // Cuerpo del correo
    
    // Crear la URL de Gmail (también puedes usar otros servicios de correo como Outlook)
    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Abrir la URL en una nueva pestaña
    window.open(gmailLink, '_blank');
    console.log('Abriendo Gmail con el enlace:', gmailLink);
  }

}
