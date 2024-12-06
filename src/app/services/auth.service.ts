import { Injectable } from '@angular/core';
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
}
