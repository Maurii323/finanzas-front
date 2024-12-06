// Modelo User
export interface User {
    id?: number;          // ID único del usuario (opcional, para cuando el usuario ya existe)
    username: string;     // Nombre de usuario
    email: string;        // Correo electrónico
    password?: string;    // Contraseña (opcional, solo para registro/login)
}
