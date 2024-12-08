import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(this.checkAuthentication());
  isAuthenticated$ = this._isAuthenticated.asObservable();

  constructor() {}

  checkAuthentication(): boolean {
    return typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
  }

  login(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this._isAuthenticated.next(true);  // Actualizar el estado de autenticación
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._isAuthenticated.next(false);  // Actualizar el estado de autenticación
  }

  // Obtener el usuario logueado en el token 
  getCurrentUser(): any {
    const token = localStorage.getItem('accessToken') || '';
    if (token) {
      try {
        // Decodificar el token
        const decoded: any = jwtDecode(token);
        // Verificar que decoded.user esté presente
        if (decoded && decoded.user_id) {
          return decoded.user_id;
        } else {
          console.error('El token no contiene la propiedad "user".');
          return null;
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
    console.error('No hay token de acceso en el almacenamiento local.');
    return null;
  }
}
