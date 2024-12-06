import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TransaccionesComponent } from './components/transacciones/transacciones.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {path:'', component: LoginComponent},
    {path:'register', component: RegisterComponent},
    {path:'transacciones', component: TransaccionesComponent, canActivate: [AuthGuard]},    // solo accesible si el guard devuelve true(esta autenticado)
    {path:'categorias', component: CategoriasComponent, canActivate: [AuthGuard]},
    { path: '**', redirectTo: '', pathMatch: 'full' }   // ruta no encotrada redirige al login
];
