/*import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Importa tu servicio de autenticación

@Component({
  selector: 'app-registro',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegistroComponent {

  email: string = ''; // Inicialización con un valor inicial vacío
  password: string = ''; // Inicialización con un valor inicial vacío

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.email, this.password)
      .subscribe(
        (response) => {
          console.log('Usuario registrado exitosamente:', response);
          // Aquí puedes redirigir al usuario a una página de éxito o hacer cualquier otra acción necesaria
        },
        (error) => {
          console.error('Error al registrar usuario:', error);
          // Aquí puedes manejar errores y mostrar mensajes al usuario
        }
      );
  }
}*/
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-registro',
  templateUrl: './register-component.component.html',
  styleUrls: ['./register-component.component.css']
})
export class RegistroComponent {

  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    console.log('Formulario enviado:', this.email, this.password);  // Agrega este log
    this.authService.register(this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Usuario registrado exitosamente:', response);
          // Aquí puedes redirigir al usuario a una página de éxito o hacer cualquier otra acción necesaria
        },
        error: (error) => {
          console.error('Error al registrar usuario:', error);
          
          // Aquí puedes manejar errores y mostrar mensajes al usuario
        },
        complete: () => {
          console.log('Proceso de registro completado');
        }
      });
  }
}

