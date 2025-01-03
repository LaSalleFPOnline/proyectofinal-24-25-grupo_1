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
  isEmailReadOnly: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  logoFile: File | null = null;
  logoPreview: string | null = null;
  rol: number = 1; // 1: Empresa, 2: Visitante, 3: Admin
  @ViewChild('popupEdicionRegistro') popupComponent!: PopupComponent;

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    const popupMessage = localStorage.getItem('popupMessage');
    console.log('Mensaje del popup:', popupMessage);
    if (popupMessage) {
      this.popupComponent.openPopup(true, popupMessage, 'success');
      localStorage.removeItem('popupMessage');
    }
  }

  onSubmit() {
    this.authService.login(this.email, this.password)
    .subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        if (response && response.token && response.rol !== undefined) {
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
        this.errorMessage = 'En email con es correcto. Por favor, regístrate';
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

}