import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EmpresaService } from '../services/empresa.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;
  userRole: number | null = null;
  dropdownOpen = false;
  isShrunk: boolean = false;
  logoUrl: string | null = null; // Define la propiedad para almacenar el logo

  constructor(private router: Router, private authService: AuthService, private elementRef: ElementRef, private empresaService: EmpresaService) {}

  ngOnInit() {
    // Suscripción al estado de autenticación
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        // Obtener el rol del usuario
        this.authService.getUserRole().subscribe(role => {
          this.userRole = role;
        });
      }
    });
    this.empresaService.getEmpresas().subscribe({
      next: (empresas) => {
        console.log('Empresas obtenidas:', empresas);
        if (empresas.length > 0) {
          // Genera la URL completa del logo si no viene directamente como `logoUrl`
          this.logoUrl = empresas[0].logo;
          console.log('Logo asignado al header:', this.logoUrl);
        }
      },
      error: (err) => {
        console.error('Error al obtener las empresas:', err);
      }
    });
  }

  goToHomePage() {
    // Verifica si estamos en la página de inicio
    if (this.router.url === '/') {
      // Desplazarse suavemente a la parte superior de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si no estamos en la página de inicio, navega a la página de inicio
      this.router.navigate(['/']);
    }
  }

  // Escucha el evento de scroll
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isShrunk = window.scrollY > 50;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Escucha el evento de clic en todo el documento
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }

  // Método para navegar con manejo de fragmentos
  navigateTo(path: string, fragment?: string) {
    // Navega a la nueva ruta y usa el fragmento
    this.router.navigate([path], { fragment }).then(() => {
        if (fragment) {
            this.scrollToFragment(fragment);
        }else if (path === 'nosotros') {
          // Si la ruta es 'nosotros', desplaza al inicio de la página
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }      
    });
    
}

  // Redirigir a la ruta correcta según el rol
  navigateToProfile() {
    this.router.navigate(['/empresa']); // Redirigir a la página de empresa para todos los roles
  }

  // Método para manejar el desplazamiento a una sección dentro de la página
  scrollToFragment(fragment?: string) {
    if (fragment) {
      const element = document.getElementById(fragment);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  handleLogin() {
    if (this.isLoggedIn) {
      this.authService.logout();
      this.isLoggedIn = false;
      this.userRole = null;
      this.router.navigate(['/']); // Redirigir a inicio o donde se considere adecuado
    } else {
      this.router.navigate(['/login']); // Redirige a la página de login
    }
  }

  navigateAndHideMenu(path: string, fragment?: string) {
    this.navigateTo(path, fragment);
    this.isMenuOpen = false;
  }

  handleLoginAndHideMenu() {
    this.isMenuOpen = false;
    this.handleLogin();
  }

  handleLogout() {
    this.handleLogin(); // Usa handleLogin para manejar logout y redirección
    this.isMenuOpen = false; // Cierra el menú en dispositivos móviles
    this.closeDropdown(); // Cierra el dropdown
  }

  closeDropdown() {
    this.dropdownOpen = false; // Cierra el menú desplegable
  }
}
