import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.authService.getUserRole().subscribe(role => {
          this.userRole = role;
        });
      }
    });
  }

  navigateTo(path: string, fragment?: string) {
    this.router.navigate([path], { fragment }).then(() => {
      if (fragment) {
        const element = document.getElementById(fragment);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
  }
  

  handleLogin() {
    if (this.isLoggedIn) {
      this.authService.logout();
      this.isLoggedIn = false;
      this.userRole = null;
      this.router.navigate(['/feria']); // Redirigir a inicio o donde se considere adecuado
    } else {
      this.router.navigate(['/login']); // Redirige a la página de login
    }
  }

  navigateAndHideMenu(path: string, fragment?: string) {
    this.navigateTo(path, fragment);
    this.isMenuOpen = false;
  }

  handleLoginAndHideMenu() {
    this.handleLogin();
    this.isMenuOpen = false;
  }

  handleLogout() {
    this.handleLogin(); // Usa handleLogin para manejar logout y redirección
  }
  closeDropdown() {
    this.dropdownOpen = false; // Cierra el menú desplegable
  }
}
