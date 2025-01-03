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
  logoUrl: string | null = null;

  constructor(private router: Router, private authService: AuthService, private elementRef: ElementRef, private empresaService: EmpresaService) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.getUserRole().subscribe(role => {
          this.userRole = role;
        });
      }
    });
    this.empresaService.getEmpresas().subscribe({
      next: (empresas) => {
        console.log('Empresas obtenidas:', empresas);
        if (empresas.length > 0) {
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
    if (this.router.url === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigate(['/']);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isShrunk = window.scrollY > 50;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }

  navigateTo(path: string, fragment?: string) {
    this.router.navigate([path], { fragment }).then(() => {
        if (fragment) {
            this.scrollToFragment(fragment);
        }else if (path === 'nosotros') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/empresa']);
  }

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
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/login']);
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
    this.handleLogin();
    this.isMenuOpen = false;
    this.closeDropdown();
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

}