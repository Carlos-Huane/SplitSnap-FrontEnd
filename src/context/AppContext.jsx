import { createContext, useContext, useReducer, useEffect } from 'react'

// ─── Estado inicial: sin grupos (experiencia real desde cero) ──────────────
const initialState = {
  groups: [],
  expenses: [],
  debts: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.group] }

    case 'ADD_EXPENSE': {
      const newExpenses = [...state.expenses, action.expense]
      const newDebts = [...state.debts, ...(action.debts || [])]
      return { ...state, expenses: newExpenses, debts: newDebts }
    }

    case 'MARK_DEBT_PAID':
      return {
        ...state,
        debts: state.debts.map(d =>
          d.id === action.debtId ? { ...d, status: 'paid' } : d
        ),
      }

    case 'ADD_MEMBER_TO_GROUP':
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === action.groupId
            ? { ...g, memberIds: [...new Set([...g.memberIds, action.userId])] }
            : g
        ),
      }

    default:
      return state
  }
}

// ─── Helpers exportados para generar IDs únicos ────────────────────────────
export const genId = (prefix = 'x') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

// Genera las deudas a partir de un gasto
export function buildDebts(expense) {
  return expense.splitBetween
    .filter(split => split.userId !== expense.paidBy && split.amount > 0)
    .map((split, idx) => ({
      id: genId('d'),
      groupId: expense.groupId,
      fromUserId: split.userId,
      toUserId: expense.paidBy,
      amount: parseFloat(split.amount.toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }))
}

// ─── Context ───────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('splitsnap_v1')
      return saved ? JSON.parse(saved) : init
    } catch {
      return init
    }
  })

  // Persistir en localStorage en cada cambio de estado
  useEffect(() => {
    localStorage.setItem('splitsnap_v1', JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
