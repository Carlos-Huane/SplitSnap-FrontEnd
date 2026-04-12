/**
 * ============================================================
 * GROUPS — Sección de Grupos (y todas sus subpantallas)
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
 *   /empty                    → pages/EmptyState.jsx
 *
 * RESPONSABLE:
 *   Integrante 2
 *
 * ¿QUÉ VA ACÁ?
 *   - Grupos (groups)
 *   - Gastos de esos grupos (expenses)
 *   - Deudas generadas (debts)
 *   - Ítems de recibos escaneados (receiptItems)
 *   - Plantillas de emojis para Crear Grupo
 *
 * ¿QUÉ NO VA ACÁ?
 *   - Usuarios / miembros invitables → `global.js` (users)
 *   - Categorías de gasto → `global.js` (categories)
 *   - Historial de movimientos → `historial.js` (transactions)
 *
 * EJEMPLO DE USO EN GroupDetail.jsx:
 *   import { useParams } from 'react-router-dom'
 *   import { users, currentUser } from '../data/global'
 *   import { groups, expenses, debts } from '../data/groups'
 *
 *   const { id } = useParams()
 *   const group = groups.find(g => g.id === id)
 *   const groupExpenses = expenses.filter(e => e.groupId === id)
 *   const members = group.memberIds.map(uid => users.find(u => u.id === uid))
 */

// ------------------------------------------------------------
// GRUPOS
// ------------------------------------------------------------
export const groups = [
  {
    id: 'g1',
    name: 'Viaje a Máncora',
    description: 'Fin de semana en la playa con los amigos',
    emoji: '🏖️',
    createdBy: 'u1',
    createdAt: '2026-03-01',
    memberIds: ['u1', 'u2', 'u3', 'u4'],
  },
  {
    id: 'g2',
    name: 'Cena del viernes',
    description: 'Restaurante italiano en Miraflores',
    emoji: '🍝',
    createdBy: 'u2',
    createdAt: '2026-03-15',
    memberIds: ['u1', 'u2', 'u3'],
  },
  {
    id: 'g3',
    name: 'Depa compartido',
    description: 'Gastos del departamento',
    emoji: '🏠',
    createdBy: 'u1',
    createdAt: '2026-01-10',
    memberIds: ['u1', 'u4', 'u5'],
  },
]

// ------------------------------------------------------------
// GASTOS — cada gasto pertenece a un grupo
// ------------------------------------------------------------
// `splitBetween` guarda cuánto le toca a cada miembro.
// `items` solo se llena si el gasto vino de un recibo escaneado.
export const expenses = [
  {
    id: 'e1',
    groupId: 'g1',
    description: 'Hospedaje 2 noches',
    amount: 480.0,
    paidBy: 'u1',
    splitBetween: [
      { userId: 'u1', amount: 120.0 },
      { userId: 'u2', amount: 120.0 },
      { userId: 'u3', amount: 120.0 },
      { userId: 'u4', amount: 120.0 },
    ],
    date: '2026-03-02',
    category: 'Hospedaje',
    items: [],
  },
  {
    id: 'e2',
    groupId: 'g1',
    description: 'Cena en el malecón',
    amount: 180.0,
    paidBy: 'u2',
    splitBetween: [
      { userId: 'u1', amount: 45.0 },
      { userId: 'u2', amount: 45.0 },
      { userId: 'u3', amount: 45.0 },
      { userId: 'u4', amount: 45.0 },
    ],
    date: '2026-03-02',
    category: 'Comida',
    items: [
      { id: 'i1', name: 'Ceviche mixto',        price: 45.0, assignedTo: ['u1'] },
      { id: 'i2', name: 'Arroz con mariscos',   price: 50.0, assignedTo: ['u2'] },
      { id: 'i3', name: 'Chicharrón de pescado',price: 40.0, assignedTo: ['u3'] },
      { id: 'i4', name: 'Tallarín saltado',     price: 45.0, assignedTo: ['u4'] },
    ],
  },
  {
    id: 'e3',
    groupId: 'g2',
    description: 'Pizza y bebidas',
    amount: 135.0,
    paidBy: 'u3',
    splitBetween: [
      { userId: 'u1', amount: 45.0 },
      { userId: 'u2', amount: 45.0 },
      { userId: 'u3', amount: 45.0 },
    ],
    date: '2026-03-15',
    category: 'Comida',
    items: [],
  },
  {
    id: 'e4',
    groupId: 'g3',
    description: 'Alquiler marzo',
    amount: 1500.0,
    paidBy: 'u1',
    splitBetween: [
      { userId: 'u1', amount: 500.0 },
      { userId: 'u4', amount: 500.0 },
      { userId: 'u5', amount: 500.0 },
    ],
    date: '2026-03-01',
    category: 'Alquiler',
    items: [],
  },
  {
    id: 'e5',
    groupId: 'g3',
    description: 'Supermercado',
    amount: 220.5,
    paidBy: 'u4',
    splitBetween: [
      { userId: 'u1', amount: 73.5 },
      { userId: 'u4', amount: 73.5 },
      { userId: 'u5', amount: 73.5 },
    ],
    date: '2026-03-10',
    category: 'Compras',
    items: [],
  },
]

// ------------------------------------------------------------
// DEUDAS — derivadas de los gastos
// ------------------------------------------------------------
// status: 'pending' | 'paid'
export const debts = [
  { id: 'd1', groupId: 'g1', fromUserId: 'u2', toUserId: 'u1', amount: 120.0, status: 'pending', createdAt: '2026-03-02' },
  { id: 'd2', groupId: 'g1', fromUserId: 'u3', toUserId: 'u1', amount: 120.0, status: 'pending', createdAt: '2026-03-02' },
  { id: 'd3', groupId: 'g1', fromUserId: 'u4', toUserId: 'u1', amount: 120.0, status: 'paid',    createdAt: '2026-03-02' },
  { id: 'd4', groupId: 'g1', fromUserId: 'u1', toUserId: 'u2', amount: 45.0,  status: 'pending', createdAt: '2026-03-02' },
  { id: 'd5', groupId: 'g2', fromUserId: 'u1', toUserId: 'u3', amount: 45.0,  status: 'pending', createdAt: '2026-03-15' },
  { id: 'd6', groupId: 'g2', fromUserId: 'u2', toUserId: 'u3', amount: 45.0,  status: 'paid',    createdAt: '2026-03-15' },
  { id: 'd7', groupId: 'g3', fromUserId: 'u4', toUserId: 'u1', amount: 500.0, status: 'pending', createdAt: '2026-03-01' },
  { id: 'd8', groupId: 'g3', fromUserId: 'u5', toUserId: 'u1', amount: 500.0, status: 'pending', createdAt: '2026-03-01' },
]

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
