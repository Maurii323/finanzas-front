import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refresh = false; // Flag para controlar la operación de refresh
  private apiUrl = environment.apiUrl;
  private refreshTokenInProgress: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null); // Maneja la cola de solicitudes

  constructor(private http: HttpClient,private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Excluir endpoints que no necesitan el token
    const excludedUrls = [`${this.apiUrl}/login`, `${this.apiUrl}/register`, `${this.apiUrl}/refresh/`];
    if (excludedUrls.some(url => request.url.startsWith(url))) {
      return next.handle(request);
    }

    const accessToken = localStorage.getItem('accessToken') || '';

    // Agregar token actual al encabezado de la solicitud
    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return next.handle(modifiedRequest).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && localStorage.getItem('refreshToken')) {
          // Si ya se está actualizando el token, espera
          if (this.refresh) {
            return this.waitForTokenRefresh(request, next);
          } else {
            this.refresh = true;
            return this.refreshAccessToken().pipe(
              switchMap((newToken: string) => {
                this.refresh = false;
                this.refreshTokenInProgress.next(newToken);

                // Reintentar la solicitud original con el nuevo token
                const retriedRequest = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                });
                return next.handle(retriedRequest);
              }),
              catchError((refreshErr) => {
                this.refresh = false;
                this.refreshTokenInProgress.next(null); // Notificar error
                return throwError(() => refreshErr);
              })
            );
          }
        }

        // Si no es un error relacionado con autorización, propagar el error
        return throwError(() => err);
      })
    );
  }

  private refreshAccessToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post<any>(`${this.apiUrl}/refresh/`, { refresh: refreshToken }, { withCredentials: true }).pipe(
      switchMap((res) => {
        localStorage.setItem('accessToken', res.access);
        return new Observable<string>((observer) => {
          observer.next(res.access);
          observer.complete();
        });
      }),
      catchError((error) => {
        // Si el refresh token ha expirado o hay un error en la actualización
        if (error.status === 401) {
          this.authService.logout();  // Llamar al logout
          return throwError(() => new Error('Refresh token expirado'));
        }
        return throwError(() => error);
      })
    );
  }

  private waitForTokenRefresh(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.refreshTokenInProgress.pipe(
      filter(token => token !== null), // Esperar hasta que el token esté disponible
      take(1), // Solo tomar el primer valor
      switchMap((newToken) => {
        const retriedRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return next.handle(retriedRequest);
      })
    );
  }
}