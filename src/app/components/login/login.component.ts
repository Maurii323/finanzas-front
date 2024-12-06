import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthInterceptor } from '../../interceptors/auth.interceptor';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  private apiUrl = environment.apiUrl;
  errorMessage?: string;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  // metodo para hacer el login en la api
  submit() {
    // withCredentials: True permite obtener cookies de la api, ahi se mandan los tokens
    this.http.post(`${this.apiUrl}/login/`, this.form.getRawValue(), {withCredentials: true})
      .subscribe({
        next: (res: any) => {
          // Asignar el token de acceso y refresh al localStorage
          this.authService.login(res.access, res.refresh);
          // Redirigir al usuario al inicio
          this.router.navigate(['/transacciones']);
        },
        error: (error) => {
          // Manejar errores del backend
          if (error.status === 400 || error.status === 401) {
            this.errorMessage = error.error?.error || 'Credenciales inválidas.';
          } else {
            this.errorMessage = 'Ocurrió un error inesperado. Intenta nuevamente.';
          }
            console.error('Error en el inicio de sesión:', error);
        }
      });
  }

    // metodo para manejar los errores del formulario
    hasErrors(controlName: string, typeError:string){
      // retorna true si lo que ingresa el usuario tiene un error de validacion y  si el usuario entro y salio del input
      return this.form.get(controlName)?.hasError(typeError) && this.form.get(controlName)?.touched
    }
}
