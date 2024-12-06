import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Transaccion, Categoria } from '../../models/transaccion.model';


@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.css'
})
export class TransaccionesComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder 
  ) { }

  form!: FormGroup;
  private apiUrl = environment.apiUrl;
  errorMessage?: string;
  transactionsList: Transaccion[] = [];
  categoryList: Categoria[] = [];
  balance?: number;

  ngOnInit(): void {
    /*
    id: number;
    user: User;
    nombre: string;
    tipo: string;
    categoria: Categoria;
    monto: number;
    descripcion: string;
    fecha: Date;
    */
   // formulario para crear una transaccion
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      categoria:  ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      monto: [0, Validators.required],
      descripcion: ['', [Validators.required]]
    });
    
    // get all de transacciones
    this.http.get<Transaccion[]>(`${this.apiUrl}/finanzas/transaccion/`)
      .subscribe({
        next: (data: Transaccion[]) => {
          this.transactionsList = data
        },
        error: (e) => {
          console.log(e);
          this.router.navigate(['/login']);
        }
      });

      // get all de categorias
      this.http.get<Categoria[]>(`${this.apiUrl}/finanzas/categorias/`)
      .subscribe({
        next: (data: Categoria[]) => {
          this.categoryList = data
        },
        error: (e) => {
          console.log(e);
          this.router.navigate(['/login']);
        }
      });

  }

  // crear una transaccion
  postTransaccion() {

    // llenar el objeto transaccion

    this.http.post<Transaccion>(`${this.apiUrl}/finanzas/transaccion/`, {})

  }

  // calcular el balance de todas las transacciones
  calculateBalance() {
    // calcular balance con transaccionList
  }

  // eliminar una transaccion
  deleteTransaccion() {

  }

  // modificar una transaccion
  putTransaccion() {
    
  }

  // metodo para manejar los errores del formulario
  hasErrors(controlName: string, typeError:string){
    // retorna true si lo que ingresa el usuario tiene un error de validacion y  si el usuario entro y salio del input
    return this.form.get(controlName)?.hasError(typeError) && this.form.get(controlName)?.touched
  }

}
