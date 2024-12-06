import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Transaccion } from '../../models/transaccion.model';


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
    private router: Router
  ) { }
  apiUrl = environment.apiUrl;
  transactionsList: Transaccion[] = []

  ngOnInit(): void {
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
  }

}
