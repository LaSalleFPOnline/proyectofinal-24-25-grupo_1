import { Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { HomePageComponent } from './home-page/home-page.component';
import { FeriaPageComponent } from './feria-page/feria-page.component';
import { PerfilAdminComponent } from './perfil-admin/perfil-admin.component';
import { PerfilEmpresaComponent } from './perfil-empresa/perfil-empresa.component';
import { RegistroComponent } from './register-component/register-component.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginComponentComponent },
  { path: 'feria', component: FeriaPageComponent },
  { path: 'admin', component: PerfilAdminComponent },
  { path: 'empresa', component: PerfilEmpresaComponent },
  /*para registrar usuarios dummy*/
  { path: 'register', component: RegistroComponent },
];