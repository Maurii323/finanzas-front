import { User } from './user.model.js';


export interface Categoria{
    id: number;
    user: User;
    nombre: string;
    descripcion: string;
}

export interface Transaccion{
    id: number;
    user: User;
    nombre: string;
    tipo: string;
    categoria: Categoria;
    monto: number;
    descripcion: string;
    fecha: Date;
}

