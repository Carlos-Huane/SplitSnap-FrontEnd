/**
 * ============================================================
 * GLOBAL — Datos compartidos por toda la app
 * ============================================================
 *
 * ¿QUÉ ES ESTO?
 * Datos que se usan en MÁS DE UNA sección. Si algo solo lo usa
 * una pantalla, NO va aquí → va en el archivo de esa sección.
 *
 * RUTAS QUE LO USAN:
 *   Prácticamente todas (usuarios, sesión, categorías).
 *
 * RESPONSABLE:
 *   Carlos (PM) — cualquier cambio debe avisarse al equipo,
 *   porque afecta a múltiples pantallas.
 *
 * REGLAS:
 *   - Si vas a agregar un usuario de prueba, agrégalo acá.
 *   - Si vas a agregar una categoría nueva de gasto, agrégala acá.
 *   - NO agregues datos específicos de una sola pantalla.
 */

// ------------------------------------------------------------
// USUARIOS — base compartida (usado por login, registro, grupos, etc.)
// ------------------------------------------------------------
export const users = [
  {
    id: 'u1',
    name: 'Carlos Ramírez',
    email: 'carlos@splitsnap.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=12',
    phone: '+51 999 111 222',
    currency: 'PEN',
    createdAt: '2026-01-15',
  },
  {
    id: 'u2',
    name: 'María González',
    email: 'maria@splitsnap.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=47',
    phone: '+51 999 333 444',
    currency: 'PEN',
    createdAt: '2026-01-20',
  },
  {
    id: 'u3',
    name: 'Luis Torres',
    email: 'luis@splitsnap.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=33',
    phone: '+51 999 555 666',
    currency: 'PEN',
    createdAt: '2026-02-01',
  },
  {
    id: 'u4',
    name: 'Ana Flores',
    email: 'ana@splitsnap.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=45',
    phone: '+51 999 777 888',
    currency: 'PEN',
    createdAt: '2026-02-10',
  },
  {
    id: 'u5',
    name: 'Diego Vargas',
    email: 'diego@splitsnap.com',
    password: '123456',
    avatar: 'https://i.pravatar.cc/150?img=15',
    phone: '+51 999 999 000',
    currency: 'PEN',
    createdAt: '2026-02-15',
  },
]

// ------------------------------------------------------------
// USUARIO ACTUAL — simula el usuario logueado
// ------------------------------------------------------------
// Mientras no haya backend, el "logueado" siempre es Carlos.
// Cámbialo para probar la app como otro usuario.
export const currentUser = users[0]

// ------------------------------------------------------------
// CATEGORÍAS DE GASTO — usado al crear/editar gastos
// ------------------------------------------------------------
export const categories = [
  { id: 'c1', name: 'Comida',         emoji: '🍽️' },
  { id: 'c2', name: 'Hospedaje',      emoji: '🏨' },
  { id: 'c3', name: 'Transporte',     emoji: '🚗' },
  { id: 'c4', name: 'Alquiler',       emoji: '🏠' },
  { id: 'c5', name: 'Compras',        emoji: '🛒' },
  { id: 'c6', name: 'Entretenimiento',emoji: '🎉' },
  { id: 'c7', name: 'Otros',          emoji: '📦' },
]
