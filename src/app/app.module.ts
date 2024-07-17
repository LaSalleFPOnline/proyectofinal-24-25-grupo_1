import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegistroComponent } from './register-component/register-component.component'; // Import RouterModule
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { routes } from './app.routes'; // Importar las rutas desde app.routes

@NgModule({
  declarations: [
    AppComponent,
    LoginComponentComponent,
    RegistroComponent,
    
  ],
  imports: [
    BrowserModule,FormsModule,RouterModule.forRoot(routes)
  ],
  providers: [ provideHttpClient(withInterceptorsFromDi()), AuthService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
