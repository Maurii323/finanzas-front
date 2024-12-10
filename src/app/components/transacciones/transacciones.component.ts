import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Transaccion, Categoria } from '../../models/transaccion.model';
import { AuthService } from '../../services/auth.service';
import { NgbModal,NgbModalModule  } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,NgbModalModule,MatSnackBarModule   ],
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.css'
})
export class TransaccionesComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private modalService: NgbModal,
    private snackBar: MatSnackBar   // notificaciones
  ) { }

  formTransaction!: FormGroup;
  formCategory!: FormGroup;
  private apiUrl = environment.apiUrl;
  transactionsList: Transaccion[] = [];
  categoryList: Categoria[] = [];
  balance: number = 0.0;

  // metodo para abrir un modal de ng-bootstrap para editar transacciones
  openModal(content: any, transaction: any) {
    const modalRef = this.modalService.open(content);
    modalRef.result.then();

    // asignar los valores del form a los valores de la transaccion
    this.formTransaction.setValue({
      nombre: transaction.nombre,
      categoria: transaction.categoria.id ,
      tipo: transaction.tipo,
      monto: transaction.monto,
      descripcion: transaction.descripcion
    });

    // pasar la transacción seleccionada al modal
    content.transaction = transaction;
  }

  // metodo para realizar notificaciones
  showMessage(message:string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000, // Tiempo en milisegundos
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }

  // inicio del componente
  ngOnInit(): void {
    // formulario para crear una transaccion
    this.formTransaction = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      categoria:  [0, [Validators.required]],
      tipo: ['', [Validators.required]],
      monto: [0, Validators.required],
      descripcion: ['']
    });
    
    // formulario para crear una categoria
    this.formCategory = this.formBuilder.group({
      nombreCategoria: ['', [Validators.required]]
    });
    
    // ejecuta los getAll en el inicio del componente
    this.getAllCategory()
    this.getAllTransaction()
  }

  //Obtiene todas las transacciones
  getAllTransaction() {
    this.http.get<Transaccion[]>(`${this.apiUrl}/finanzas/transaccion/`)
      .subscribe({
        next: (data: Transaccion[]) => {
          this.transactionsList = data
          // calcula el balance 
          this.calculateBalance()
        },
        error: (e) => {
          console.log(e);
        }
      });
  }

  // Obtiene todas las categorias
  getAllCategory() {
    this.http.get<Categoria[]>(`${this.apiUrl}/finanzas/categorias/`)
    .subscribe({
      next: (data: Categoria[]) => {
        this.categoryList = data
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  // enviar una transaccion a la api
  postTransaccion() {
    // crear la transaccion
    const transaction = {
      user: this.authService.getCurrentUser(),        //usuario logueado
      categoria: this.formTransaction.value.categoria || null,  
      nombre: this.formTransaction.value.nombre,
      tipo: this.formTransaction.value.tipo,
      monto: this.formTransaction.value.monto,
      descripcion: this.formTransaction.value.descripcion,
      fecha: new Date().toISOString()  // Fecha actual
    };
    // hacer la request a la api para crear la transaccion en el backend
    this.http.post<Transaccion>(`${this.apiUrl}/finanzas/transaccion/`, transaction)
    .subscribe({
      next: (res: any) => {
        this.showMessage("Transaccion creada con exito")
        this.formTransaction.reset();    // resetea el form
        this.getAllTransaction()    // carga las transacciones actualizadas
        this.calculateBalance()     // calcula el nuevo balance
      },
      error: (e) => {
        console.log(e);
        this.showMessage("Error en la creacion de la transaccion, intente nuevamente")
      }
    });
    
  }

  postCategory() {
    // crear la categoria
    const category = {
      user: this.authService.getCurrentUser(),        //usuario logueado
      nombre: this.formCategory.value.nombreCategoria
    };
    // hacer la request a la api para crear la transaccion en el backend
    this.http.post<Transaccion>(`${this.apiUrl}/finanzas/categorias/`, category)
    .subscribe({
      next: (res: any) => {
        this.showMessage("Categoria creada con exito")
        this.formCategory.reset();    // resetea el form
        this.getAllCategory()    // carga las categorias actualizadas
      },
      error: (e) => {
        console.log(e);
        this.showMessage("Error en la creacion de la categoria, intente nuevamente")
      }
    });
  }

  // calcular el balance de todas las transacciones
  calculateBalance() {
    this.balance = 0
    for (const transaction of this.transactionsList) {
      // si es costo lo resta, si es ingreso lo suma
      if (transaction.tipo == "costo") {
        this.balance -= transaction.monto
      }else if(transaction.tipo == "ingreso") {
        this.balance += transaction.monto
      }
      
    }
  }

  // eliminar una transaccion
  deleteTransaccion(transactionId: number,modal: any): void {
    this.http.delete(`${this.apiUrl}/finanzas/transaccion/${transactionId}/`).subscribe({
      next: () => {
        // Eliminar la transacción de la lista local
        this.transactionsList = this.transactionsList.filter(
          (transaction) => transaction.id !== transactionId
        );
        this.calculateBalance()     // calcula el nuevo balance
        modal.close();              // Cerrar el modal
        this.showMessage("Transaccion eliminada con exito")
      },
      error: (err) => {
        this.showMessage("Error al eliminar la transaccion, intente nuevamente")
        console.error('Error al eliminar la transacción:', err);
      },
    });
  }

  // modificar una transaccion
  putTransaccion(transactionId:number,modal:any) {
    // Encuentra la transacción a actualizar
    const transaction = this.transactionsList.find(
      (transaction) => transaction.id === transactionId
    );
    
    const updatedTransaction = {
      id: transaction?.id,
      user: transaction?.user,
      categoria: this.formTransaction.value.categoria || null,  
      nombre: this.formTransaction.value.nombre,
      tipo: this.formTransaction.value.tipo,
      monto: this.formTransaction.value.monto,
      descripcion: this.formTransaction.value.descripcion,
      fecha: transaction?.fecha
    };
  
    // Realiza la solicitud PUT
    this.http.put(`${this.apiUrl}/finanzas/transaccion/${transactionId}/`, updatedTransaction).subscribe({
      next: (response: any) => {
        // Actualiza la transacciones localmente
        this.getAllTransaction()
        this.calculateBalance()     // calcula el nuevo balance
        modal.close();
        this.showMessage(`Transacción modificada con éxito.`)
      },
      error: (err) => {
        this.showMessage(`"Error al modificar la transaccion, intente nuevamente"`)
        console.error('Error al modificar la transacción:', err);
      },
    });
  }


  // metodo para manejar los errores del formulario
  hasErrors(controlName: string, typeError: string): boolean {
    const controlTransaction = this.formTransaction?.get(controlName);
    const controlCategory = this.formCategory?.get(controlName);
    
    //operador condicional (?) verifica si controlTransaction tiene un valor válido, si no tiene devuelve false
    const transactionError = controlTransaction 
      ? controlTransaction.hasError(typeError) && controlTransaction.touched 
      : false;
  
    const categoryError = controlCategory 
      ? controlCategory.hasError(typeError) && controlCategory.touched 
      : false;
  
    return transactionError || categoryError;
  }

}
