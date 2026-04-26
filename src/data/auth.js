/**
 * ============================================================
 * AUTH — Login y Registro
 * ============================================================
 *
 * RUTAS:
 *   /login     → pages/Login.jsx
 *   /register  → pages/Register.jsx
 *
 * RESPONSABLE:
 *   Integrante 4 (Register) + quien tome Login
 *
 * ¿QUÉ VA ACÁ?
 *   - Credenciales de prueba para el formulario de Login.
 *   - Mensajes de error/validación simulados.
 *   - Campos del formulario de registro.
 *
 * ¿QUÉ NO VA ACÁ?
 *   - La lista de usuarios → vive en `global.js` (es compartida).
 *     Si en Login necesitas validar un email/contraseña, importa
 *     `users` desde global.js y busca ahí.
 *
 * EJEMPLO DE USO EN Login.jsx:
 *   import { users } from '../data/global'
 *   import { testCredentials, authMessages } from '../data/auth'
 *
 *   const user = users.find(u => u.email === email && u.password === pass)
 *   if (!user) setError(authMessages.invalidCredentials)
 */

// ------------------------------------------------------------
// CREDENCIALES DE PRUEBA — se muestran como ayuda en Login
// ------------------------------------------------------------
export const testCredentials = [
  { email: 'carlos@splitsnap.com', password: '123456', label: 'Usuario principal' },
  { email: 'maria@splitsnap.com',  password: '123456', label: 'Usuario secundario' },
]

// ------------------------------------------------------------
// MENSAJES — textos mostrados al usuario
// ------------------------------------------------------------
export const authMessages = {
  invalidCredentials: 'Email o contraseña incorrectos',
  emailAlreadyUsed: 'Ese email ya está registrado',
  passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
  emailInvalid: 'Ingresa un email válido',
  requiredField: 'Este campo es obligatorio',
  registerSuccess: '¡Cuenta creada con éxito!',
  loginSuccess: '¡Bienvenido de vuelta!',
}

// ------------------------------------------------------------
// FORMULARIO DE REGISTRO — estructura de campos
// ------------------------------------------------------------
// Útil para renderizar el formulario dinámicamente o validar.
export const registerFields = [
  { name: 'name',     label: 'Nombre completo', type: 'text',     placeholder: 'Ej. Juan Pérez',   required: true },
  { name: 'email',    label: 'Email',           type: 'email',    placeholder: 'tu@email.com',     required: true },
  { name: 'phone',    label: 'Teléfono',        type: 'tel',      placeholder: '+51 999 000 000',  required: false },
  { name: 'password', label: 'Contraseña',      type: 'password', placeholder: 'Mínimo 6 dígitos', required: true },
  { name: 'confirmPassword', label: 'Confirmar contraseña', type: 'password', placeholder: 'Repite tu contraseña', required: true },
]
