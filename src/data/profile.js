/**
 * ============================================================
 * PROFILE / PRIVACIDAD — Perfil y Configuración del usuario
 * ============================================================
 *
 * RUTAS:
 *   /profile → pages/Profile.jsx
 *
 * RESPONSABLE:
 *   Integrante 4
 *
 * ¿QUÉ VA ACÁ?
 *   - Estadísticas personales mostradas en el perfil
 *   - Opciones del menú de configuración
 *   - Opciones de privacidad
 *   - Preferencias (idioma, moneda, notificaciones)
 *
 * ¿QUÉ NO VA ACÁ?
 *   - Los datos del usuario en sí (nombre, email, avatar)
 *     → eso está en `currentUser` dentro de `global.js`.
 *
 * EJEMPLO DE USO EN Profile.jsx:
 *   import { currentUser } from '../data/global'
 *   import { profileStats, settingsMenu, privacyOptions } from '../data/profile'
 */

// ------------------------------------------------------------
// ESTADÍSTICAS DEL PERFIL — tarjetas numéricas
// ------------------------------------------------------------
// Estos números son mock. Cuando haya backend se calculan real.
export const profileStats = [
  { id: 'ps1', label: 'Grupos activos',   value: 3,    emoji: '👥' },
  { id: 'ps2', label: 'Gastos ', value: 24, emoji: '💸' },
  { id: 'ps3', label: 'Total ',    value: 2480, emoji: '📊', isCurrency: true },
]

// ------------------------------------------------------------
// MENÚ DE CONFIGURACIÓN — lista de opciones del perfil
// ------------------------------------------------------------
export const settingsMenu = [
  { id: 'sm1', label: 'Editar perfil',       emoji: '👤', section: 'cuenta' },
  { id: 'sm2', label: 'Métodos de pago',     emoji: '💳', section: 'cuenta' },
  { id: 'sm3', label: 'Notificaciones',      emoji: '🔔', section: 'preferencias' },
  { id: 'sm4', label: 'Privacidad',          emoji: '🛡️', section: 'privacidad' },
  { id: 'sm5', label: 'Cerrar sesión',       emoji: '🚪', section: 'cuenta', danger: true },
  
]

// ------------------------------------------------------------
// OPCIONES DE PRIVACIDAD — toggles on/off
// ------------------------------------------------------------
export const privacyOptions = [
  { id: 'po1', key: 'showProfileToMembers', label: 'Mostrar mi perfil a miembros del grupo', value: true },
  { id: 'po2', key: 'allowGroupInvites',    label: 'Permitir que otros me inviten a grupos', value: true },
  { id: 'po3', key: 'shareEmail',           label: 'Compartir mi email con el grupo',         value: false },
  { id: 'po4', key: 'sharePhone',           label: 'Compartir mi teléfono con el grupo',      value: false },
  { id: 'po5', key: 'showActivityStatus',   label: 'Mostrar mi actividad reciente',           value: true },
]

// ------------------------------------------------------------
// PREFERENCIAS — defaults de configuración
// ------------------------------------------------------------
export const preferences = {
  language: 'es',
  currency: 'PEN',
  notifications: {
    newExpense: true,
    debtReminder: true,
    groupInvite: true,
    weeklySummary: false,
  },
}

// ------------------------------------------------------------
// MÉTODOS DE PAGO — Tarjetas del usuario
// ------------------------------------------------------------
export const paymentMethods = [
  { 
    id: 'pm1', 
    type: 'Visa', 
    lastFour: '4582', 
    expiry: '12/26', 
    isDefault: true, 
    brandColor: '#1A1F71' 
  },
  { 
    id: 'pm2', 
    type: 'Mastercard', 
    lastFour: '8831', 
    expiry: '08/25', 
    isDefault: false, 
    brandColor: '#EB001B' 
  },
]