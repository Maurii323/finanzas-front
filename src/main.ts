import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';

// importar los modulos que se van a utilizar globalmente
bootstrapApplication(AppComponent, {
  providers: [
    // Proveedor para el cliente http, usando interceptores desde el DI
    provideHttpClient(withInterceptorsFromDi()),

    // Proveedor para las rutas
    provideRouter(routes),

    // Registrar el interceptor en el DI
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
}).catch((err) => console.error(err));
