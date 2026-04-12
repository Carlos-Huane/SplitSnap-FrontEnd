/**
 * ============================================================
 * DASHBOARD / INICIO
 * ============================================================
 *
 * RUTAS:
 *   /dashboard → pages/Dashboard.jsx
 *
 * RESPONSABLE:
 *   Integrante 1
 *
 * ¿QUÉ VA ACÁ?
 *   - Textos de bienvenida, tarjetas de resumen, accesos rápidos.
 *   - Datos que SOLO aparecen en el Dashboard.
 *
 * ¿QUÉ NO VA ACÁ?
 *   - Los grupos del usuario → importa `groups` desde `groups.js`.
 *   - Las deudas → importa `debts` desde `groups.js`.
 *   - El usuario logueado → importa `currentUser` desde `global.js`.
 *
 * EJEMPLO DE USO EN Dashboard.jsx:
 *   import { currentUser } from '../data/global'
 *   import { groups, debts } from '../data/groups'
 *   import { quickActions, welcomeMessages } from '../data/dashboard'
 *
 *   const myGroups = groups.filter(g => g.memberIds.includes(currentUser.id))
 */

// ------------------------------------------------------------
// ACCESOS RÁPIDOS — botones grandes del Dashboard
// ------------------------------------------------------------
export const quickActions = [
  { id: 'qa1', label: 'Nuevo grupo',     emoji: '➕', route: '/groups/new' },
  { id: 'qa2', label: 'Escanear recibo', emoji: '📷', route: '/groups/g1/scan' },
  { id: 'qa3', label: 'Mis deudas',      emoji: '💰', route: '/groups/g1/debts' },
  { id: 'qa4', label: 'Historial',       emoji: '📋', route: '/historial' },
]

// ------------------------------------------------------------
// MENSAJES DE BIENVENIDA — rotan aleatoriamente
// ------------------------------------------------------------
export const welcomeMessages = [
  '¡Hola de nuevo! 👋',
  '¿Listo para dividir gastos? 💸',
  '¡Qué bueno verte! ✨',
  'Tus cuentas al día 📊',
]

// ------------------------------------------------------------
// TARJETAS DE RESUMEN — configuración visual
// ------------------------------------------------------------
// Los valores (amount) se calculan en tiempo real desde groups.js
// acá solo viven los metadatos visuales.
export const summaryCards = [
  { id: 'sc1', key: 'owes',   label: 'Debes',     color: '#EF4444', emoji: '📤' },
  { id: 'sc2', key: 'owed',   label: 'Te deben',  color: '#22C55E', emoji: '📥' },
  { id: 'sc3', key: 'groups', label: 'Grupos',    color: '#F97316', emoji: '👥' },
]

// ------------------------------------------------------------
// ACTIVIDAD RECIENTE — eventos mock del dashboard
// ------------------------------------------------------------
export const recentActivity = [
  { id: 'ra1', icon: '🍝', title: 'Cena del viernes',   subtitle: 'Luis agregó un gasto', amount: 135.0, time: 'Hace 2 horas' },
  { id: 'ra2', icon: '🏖️', title: 'Viaje a Máncora',    subtitle: 'Ana te pagó',          amount: 120.0, time: 'Ayer' },
  { id: 'ra3', icon: '🏠', title: 'Depa compartido',    subtitle: 'Tú agregaste alquiler', amount: 1500.0, time: 'Hace 3 días' },
]
