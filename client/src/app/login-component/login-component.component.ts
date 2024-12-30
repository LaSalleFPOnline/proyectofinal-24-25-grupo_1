import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})
export class LoginComponentComponent {
  email: string = '';
  password: string = '';

  emailValidado: boolean = false;
  isEmailReadOnly: boolean = false; // Nueva propiedad para controlar la edición del email
  errorMessage: string | null = null;
  successMessage: string | null = null;
  logoFile: File | null = null; // Para almacenar el archivo del logo
  logoPreview: string | null = null; // Para la vista previa del logo
  rol: number = 1; // 1: Empresa, 2: Visitante, 3: Admin


  @ViewChild('popupEdicionRegistro') popupComponent!: PopupComponent;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    const popupMessage = localStorage.getItem('popupMessage');
    console.log('Mensaje del popup:', popupMessage); // Verifica el mensaje
    if (popupMessage) {
      // Llama a openPopup con ambos argumentos
      this.popupComponent.openPopup(true, popupMessage, 'success'); // true para hacer visible el popup
      localStorage.removeItem('popupMessage'); // Limpiar el mensaje después de mostrarlo
    }
  }
  onSubmit() {
    this.authService.login(this.email, this.password)
      .subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          if (response && response.token && response.rol !== undefined) {
            // Aquí añadimos 'response.entidad' para pasarla a setToken
            this.authService.setToken(response.token, response.rol, response.entidad || '');
            localStorage.setItem('popupMessage', "Has iniciado sesión correctamente. Bienvenido a la Feria virtual de La Salle Bussiness Match");
            if (response.empresa) {
              this.authService.setEmpresa(response.empresa);
            }
            
            if (response.user) {
              this.authService.setUser(response.user);
            }
  
            if (response.user_id) {
              this.authService.setUserId(response.user_id);
            }
            
            if (response.rol === 2) { // Administrador
              this.router.navigate(['/admin']);
            } else if (response.rol === 3) { // Visitante
              this.router.navigate(['/feria']);
            } else if (response.rol === 1) { // Empresa
              this.router.navigate(['/feria']);
            } else {
              this.errorMessage = 'No se pudo determinar la ruta de redirección';
            }
          } else {
            this.errorMessage = 'Respuesta del servidor inválida';
          }
        },
        error: (error) => {
          console.error('Error al intentar iniciar sesión:', error);
          this.errorMessage = 'Credenciales inválidas';
        }
      });
  }

  validarEmail() {
    if (!this.email) {
        this.errorMessage = 'Por favor, introduce un email.';
        return;
    }

    this.authService.checkEmail(this.email).subscribe({
        next: (response: { message: string; rol?: number }) => {
            console.log('Respuesta del servidor:', response);

            if (response.rol !== undefined) {
                this.rol = response.rol;
                console.log('Rol recibido:', this.rol); // Mensaje de depuración
            } else {
                console.warn('El rol no está definido en la respuesta del servidor. Verifica el backend.');
                this.errorMessage = 'El rol no está disponible. Por favor, contacta con soporte.';
                return;
            }

            if (response.message === 'El correo está registrado sin contraseña') {
              this.errorMessage = 'El correo está registrado sin contraseña. Tienes que registrarte';  
              this.emailValidado = true; // Habilita el formulario para editar
                this.isEmailReadOnly = true; // Hace el email de solo lectura
                this.errorMessage = null;
                this.successMessage = null;
                // this.loadForm();
            } else if (response.message === 'Credenciales inválidas') {
                this.errorMessage = 'Este es un evento privdo. Contacta con tu profesor';
                this.emailValidado = false;
                this.isEmailReadOnly = false; // Permite volver a editar el email si es necesario
            } else if (response.message === 'Este correo ya está registrado') {
                // this.errorMessage = 'Este correo ya está registrado.';
                this.emailValidado = false;
                this.isEmailReadOnly = false; // Permite volver a editar el email si es necesario
            }
        },
        error: (error: any) => {
            console.error('Error al validar el email:', error);
            this.errorMessage = 'Error al verificar el email. Inténtalo de nuevo.';
        }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}