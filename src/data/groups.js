/**
 * ============================================================
 * GROUPS — Datos de referencia estáticos (solo plantillas)
 * ============================================================
 *
 * RUTAS:
 *   /groups/new               → pages/CreateGroup.jsx
 *   /groups/:id               → pages/GroupDetail.jsx
 *   /groups/:id/invite        → pages/InviteMembers.jsx
 *   /groups/:id/add-expense   → pages/AddExpense.jsx
 *   /groups/:id/scan          → pages/ScanReceipt.jsx
 *   /groups/:id/scan/review   → pages/ReviewItems.jsx
 *   /groups/:id/debts         → pages/DebtSummary.jsx
 *
 * IMPORTANTE:
 *   Los grupos, gastos y deudas en tiempo real se gestionan en
 *   src/context/AppContext.jsx (con persistencia en localStorage).
 *   Este archivo solo exporta plantillas estáticas de referencia.
 */

// ------------------------------------------------------------
// SCAN RECIBO — ítems detectados simulando respuesta de OCR
// ------------------------------------------------------------
// Esto es lo que "devolvería" Google Cloud Vision una vez integrado.
// Úsalo en ScanReceipt.jsx y ReviewItems.jsx para maquetar.
export const mockReceiptItems = [
  { id: 'r1', name: 'Lomo saltado',          price: 38.0, quantity: 1 },
  { id: 'r2', name: 'Ají de gallina',        price: 32.0, quantity: 1 },
  { id: 'r3', name: 'Causa limeña',          price: 28.0, quantity: 1 },
  { id: 'r4', name: 'Chicha morada (jarra)', price: 18.0, quantity: 1 },
  { id: 'r5', name: 'Inca Kola 500ml',       price: 8.0,  quantity: 2 },
  { id: 'r6', name: 'Postre suspiro',        price: 15.0, quantity: 2 },
]

// ------------------------------------------------------------
// EMOJIS SUGERIDOS — para elegir al crear un grupo
// ------------------------------------------------------------
export const groupEmojis = [
  '🏖️', '🍝', '🏠', '🎉', '✈️', '🎬',
  '⚽', '🎓', '🛒', '🍺', '☕', '🎂',
]
