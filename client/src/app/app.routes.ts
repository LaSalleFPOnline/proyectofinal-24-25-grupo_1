import { Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { HomePageComponent } from './home-page/home-page.component';
import { FeriaPageComponent } from './feria-page/feria-page.component';
import { PerfilAdminComponent } from './perfil-admin/perfil-admin.component';
import { PerfilEmpresaComponent } from './perfil-empresa/perfil-empresa.component';
import { RegisterComponent } from './register-component/register-component.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginComponentComponent },
  { path: 'feria', component: FeriaPageComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: PerfilAdminComponent, canActivate: [RoleGuard], data: { role: 2 } },
  { path: 'empresa', component: PerfilEmpresaComponent, canActivate: [AuthGuard] },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];