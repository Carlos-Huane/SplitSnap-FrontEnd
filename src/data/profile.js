/**
 * ============================================================
 * PROFILE — catálogos estáticos de la pantalla de Perfil
 * ============================================================
 *
 * Las estadísticas del usuario, el avatar, los créditos y los
 * datos editables se manejan en el estado global useApp() y se
 * renderizan dinámicamente en pages/Profile.jsx.
 *
 * Aquí viven solo los catálogos estáticos del menú y los
 * defaults de toggles (privacidad/notificaciones).
 */

export const settingsMenu = [
  { id: 'sm1', label: 'Editar perfil',   emoji: '👤', section: 'cuenta' },
  { id: 'sm2', label: 'Métodos de pago', emoji: '💳', section: 'cuenta' },
  { id: 'sm3', label: 'Notificaciones',  emoji: '🔔', section: 'preferencias' },
  { id: 'sm4', label: 'Privacidad',      emoji: '🛡️', section: 'privacidad' },
  { id: 'sm5', label: 'Cerrar sesión',   emoji: '🚪', section: 'cuenta', danger: true },
]

export const privacyOptions = [
  { id: 'po1', key: 'showProfileToMembers', label: 'Mostrar mi perfil a miembros del grupo', value: true },
  { id: 'po2', key: 'allowGroupInvites',    label: 'Permitir que otros me inviten a grupos', value: true },
  { id: 'po3', key: 'shareEmail',           label: 'Compartir mi email con el grupo',         value: false },
  { id: 'po4', key: 'sharePhone',           label: 'Compartir mi teléfono con el grupo',      value: false },
  { id: 'po5', key: 'showActivityStatus',   label: 'Mostrar mi actividad reciente',           value: true },
]

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
