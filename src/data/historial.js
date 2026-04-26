/**
 * ============================================================
 * HISTORIAL — Catálogo de tipos de transacción
 * ============================================================
 *
 * El historial real se construye en pages/Historial.jsx a partir
 * de `expenses` (gastos creados) y `debts` con status='paid'
 * (pagos realizados) del estado global useApp().
 *
 * Aquí solo viven los metadatos visuales por tipo.
 */

export const transactionTypes = {
  expense_created: { label: 'Gasto agregado',    emoji: '💸', color: '#F97316' },
  debt_paid:       { label: 'Pago realizado',    emoji: '✅', color: '#22C55E' },
  group_joined:    { label: 'Te uniste a grupo', emoji: '👥', color: '#3B82F6' },
  expense_edited:  { label: 'Gasto editado',     emoji: '✏️', color: '#EAB308' },
}
