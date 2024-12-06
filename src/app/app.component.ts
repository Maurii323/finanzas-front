import { Component, OnInit  } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, ReactiveFormsModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'finanzasFront';
  canLoad: boolean | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    // Esperar hasta que el estado de autenticación esté listo
    this.authService.isAuthenticated$.subscribe((authStatus) => {
      this.canLoad = authStatus;
    });
  }

  logout() {
    // elimina los token del localstorage y redirige al login
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // verifica si esta autenticado para modificar la navegacion
  isAuthenticated():boolean {
    return this.authService.checkAuthentication();
  }
}
