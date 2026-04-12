/**
 * ============================================================
 * HISTORIAL — Historial de transacciones
 * ============================================================
 *
 * RUTAS:
 *   /historial → pages/Historial.jsx
 *
 * RESPONSABLE:
 *   Integrante 3
 *
 * ¿QUÉ VA ACÁ?
 *   - Lista de transacciones (gastos agregados, deudas pagadas, etc.)
 *   - Opciones de filtro (por tipo, rango de fechas)
 *
 * ¿QUÉ NO VA ACÁ?
 *   - Los gastos/deudas en sí → `groups.js`
 *   - El usuario → `global.js`
 *
 * EJEMPLO DE USO EN Historial.jsx:
 *   import { currentUser } from '../data/global'
 *   import { transactions, transactionFilters } from '../data/historial'
 *
 *   const myHistory = transactions.filter(t => t.userId === currentUser.id)
 */

// ------------------------------------------------------------
// TIPOS DE TRANSACCIÓN — catálogo de eventos posibles
// ------------------------------------------------------------
export const transactionTypes = {
  expense_created: { label: 'Gasto agregado', emoji: '💸', color: '#F97316' },
  debt_paid:       { label: 'Pago realizado', emoji: '✅', color: '#22C55E' },
  group_joined:    { label: 'Te uniste a grupo', emoji: '👥', color: '#3B82F6' },
  expense_edited:  { label: 'Gasto editado',  emoji: '✏️', color: '#EAB308' },
}

// ------------------------------------------------------------
// TRANSACCIONES — historial mock
// ------------------------------------------------------------
// type → clave dentro de `transactionTypes`
export const transactions = [
  { id: 't1', type: 'expense_created', userId: 'u1', groupId: 'g1', amount: 480.0,  date: '2026-03-02', description: 'Hospedaje 2 noches' },
  { id: 't2', type: 'expense_created', userId: 'u2', groupId: 'g1', amount: 180.0,  date: '2026-03-02', description: 'Cena en el malecón' },
  { id: 't3', type: 'debt_paid',       userId: 'u4', groupId: 'g1', amount: 120.0,  date: '2026-03-05', description: 'Pago a Carlos' },
  { id: 't4', type: 'expense_created', userId: 'u3', groupId: 'g2', amount: 135.0,  date: '2026-03-15', description: 'Pizza y bebidas' },
  { id: 't5', type: 'debt_paid',       userId: 'u2', groupId: 'g2', amount: 45.0,   date: '2026-03-16', description: 'Pago a Luis' },
  { id: 't6', type: 'expense_created', userId: 'u1', groupId: 'g3', amount: 1500.0, date: '2026-03-01', description: 'Alquiler marzo' },
  { id: 't7', type: 'expense_created', userId: 'u4', groupId: 'g3', amount: 220.5,  date: '2026-03-10', description: 'Supermercado' },
  { id: 't8', type: 'group_joined',    userId: 'u1', groupId: 'g1', amount: 0,      date: '2026-03-01', description: 'Te uniste a Viaje a Máncora' },
]

// ------------------------------------------------------------
// FILTROS DISPONIBLES — para el dropdown de la pantalla Historial
// ------------------------------------------------------------
export const transactionFilters = [
  { id: 'all',             label: 'Todos' },
  { id: 'expense_created', label: 'Solo gastos' },
  { id: 'debt_paid',       label: 'Solo pagos' },
  { id: 'this_month',      label: 'Este mes' },
  { id: 'last_month',      label: 'Mes anterior' },
]
