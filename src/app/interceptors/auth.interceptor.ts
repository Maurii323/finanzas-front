import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse, HttpClient
} from '@angular/common/http';
import {catchError, filter, Observable, switchMap, take, throwError} from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../services/auth.service';

/*
// interceptor para agregar el acces token a todas las request a las api que necesiten autenticacion
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  static accessToken = '';
  static refreshToken = '';
  private refresh = false;  // booleano para consultar el refresh una vez
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('Interceptando solicitud:', request.url);
    // URLs que no deben incluir el token
    const excludedUrls = [`${this.apiUrl}/login`, `${this.apiUrl}/register`];
    
    // Verificar si la URL está en la lista de excluidas
    if (excludedUrls.some(url => request.url.startsWith(url))) {
      return next.handle(request); // Enviar el request sin modificar
    }

    console.log('Access Token:', AuthInterceptor.accessToken);

    // Clonar el request y añadir el token
    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${AuthInterceptor.accessToken}`,
      },
    });

    // Ejecutar la request con el token, manejar errores y realizar refresh si es necesario
    return next.handle(modifiedRequest).pipe(
      catchError((err: HttpErrorResponse) => {
        // si es un error de autenticacion
        if (err.status === 401 && !this.refresh) {
          this.refresh = true;
          console.warn('Token expirado, intentando refrescar...');

          return this.http.post(`${this.apiUrl}refresh`, {refresh: AuthInterceptor.refreshToken}, { withCredentials: true }).pipe(
            switchMap((res: any) => {
              console.log('Respuesta del refresh token:', res);
              AuthInterceptor.accessToken = res.access; // Actualizar el token

              // Reintentar el request original con el nuevo token
              const retriedRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${AuthInterceptor.accessToken}`,
                },
              });
              return next.handle(retriedRequest);
            }),
            catchError(() => {
              // Si no se puede refrescar el token, redirigir al login
              console.error('No se pudo refrescar el token, redirigiendo al login...');
              return throwError(() => err);
            })
          );
        }

        this.refresh = false;
        console.error('Error durante la solicitud:', err);
        return throwError(() => err);
      })
    );
  }


  // Verificar si el token existe para saber si un usuario esta autenticado
  static isAuthenticated(): boolean {
    return !!AuthInterceptor.accessToken;   // Retorna true si el token no es null o vacío
  }
}
*/
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refresh = false;  // booleano para consultar el refresh una vez
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('Interceptando solicitud:', request.url);

    // Excluir las solicitudes de login y registro para que no las maneje el interceptor
    const excludedUrls = [`${this.apiUrl}/login`, `${this.apiUrl}/register`,`${this.apiUrl}/refresh`];
    if (excludedUrls.some(url => request.url.startsWith(url))) {
      return next.handle(request);  // Deja pasar las solicitudes de login y registro sin modificación
    }

    // Verificar si el accessToken está expirado
    
    const accessToken = localStorage.getItem('accessToken') || '';
    /*
    if (this.isTokenExpired(accessToken)) {
      console.warn('Access token expirado, intentando refrescar...');
      return this.refreshAccessToken().pipe(
        switchMap(() => {
          const modifiedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          return next.handle(modifiedRequest);
        }),
        catchError((err) => {
          console.error('No se pudo refrescar el token, redirigiendo al login...');
          return throwError(() => err);
        })
      );
    }
    */
    // Si el token no está expirado, añadirlo en los headers de la solicitud
    const modifiedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return next.handle(modifiedRequest).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !this.refresh && localStorage.getItem('refreshToken')) {
          this.refresh = true;

          return this.refreshAccessToken().pipe(
            switchMap(() => {
              this.refresh = false;
              const retriedRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
              });
              return next.handle(retriedRequest);
            }),
            catchError(() => {
              return throwError(() => err);
            })
          );
        }

        this.refresh = false;
        console.error('Error durante la solicitud:', err);
        return throwError(() => err);
      })
    );
  }


  private isTokenExpired(token: string): boolean {
    if (!token) return true;

    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  private refreshAccessToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log("antes de intentar refrescar")
    return this.http.post(`${this.apiUrl}/refresh`, { refresh: refreshToken }, { withCredentials: true }).pipe(
      switchMap((res: any) => {
        console.log("despues de intentar refrescar", res.access)
        localStorage.setItem('accessToken', res.access);
        return new Observable((observer) => {
          observer.next(res);
          observer.complete();
        });
      })
    );
  }
  /*
  // Verificar si el token existe para saber si un usuario esta autenticado
  static isAuthenticated(): boolean {
    //const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken') || '';
    const accessToken = localStorage.getItem('accessToken') || '';
    return !!accessToken    //Retorna true si el token no es null o vacío
  }*/
}
