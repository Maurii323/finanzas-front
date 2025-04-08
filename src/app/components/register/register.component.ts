import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgClass]
})
export class RegisterComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  errorMessage!: string;
  // crea el formulario reactivo
  form!: FormGroup;
  // inyecta los modulos a utilizar
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
  }

  // metodo que se ejecuta apenas arranca el componente
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      // se registran los controladores(inputs) y validaciones
      username: ['', [Validators.required, Validators.minLength(3)]],
      password1: ['', [Validators.required, Validators.minLength(3)]],
      password2: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  // metodo para enviar el registro a la api
  submit() {
    const formData = this.form.getRawValue();
  
    this.http.post(`${this.apiUrl}/register/`, formData).subscribe({
      // en caso de exito redirige al login
      next: () => this.router.navigate(['/login']),
      // en caso de error guarda el mensaje para mostrarlo en el registro
      error: (error) => {
        console.log('Error del backend:', error);
        this.errorMessage = error.error?.error || 'An unexpected error occurred.';
      }
    });
  }

  // metodo para manejar los errores del formulario
  hasErrors(controlName: string, typeError:string){
    // retorna true si lo que ingresa el usuario tiene un error de validacion y  si el usuario entro y salio del input
    return this.form.get(controlName)?.hasError(typeError) && this.form.get(controlName)?.touched
  }

  
}
