import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegistroComponent } from './register-component/register-component.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

// Importar componentes standalone
import { HomePageComponent } from './home-page/home-page.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FeriaPageComponent } from './feria-page/feria-page.component'; // Importar el componente FeriaPage
import { PerfilAdminComponent } from './perfil-admin/perfil-admin.component'; // Importar el componente PerfilAdmin
import { PerfilEmpresaComponent } from './perfil-empresa/perfil-empresa.component'; // Importar el componente PerfilEmpresa


@NgModule({
  declarations: [
    AppComponent,
    LoginComponentComponent,
    RegistroComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
    MatButtonModule,
    MatIconModule,
    // Importar componentes standalone
    HomePageComponent,
    FooterComponent,
    FeriaPageComponent, // Declarar el componente FeriaPage
    PerfilAdminComponent, // Declarar el componente PerfilAdmin
    PerfilEmpresaComponent // Declarar el componente PerfilEmpresa
  ],
  providers: [AuthService, provideHttpClient(withInterceptorsFromDi()), provideAnimations()],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
