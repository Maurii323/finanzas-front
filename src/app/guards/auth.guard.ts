import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor( private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    if (this.authService.checkAuthentication()) {
      return true; // Permite el acceso
    } else {
      this.router.navigate(['/login']); // Redirige al login si no está autenticado
      return false;
    }
  }
}
