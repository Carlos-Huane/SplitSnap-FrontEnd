import { createContext, useContext, useReducer, useEffect } from 'react'
import { users as seedUsers } from '../data/global'

const initialState = {
  groups: [],
  expenses: [],
  debts: [],
  credits: 0,
  profileAvatar: null,
  creditTransactions: [],
  customUsers: [],
  currentUserId: null,
  userOverrides: {},
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
          d.id === action.debtId
            ? { ...d, status: 'paid', paidAt: new Date().toISOString().split('T')[0], paidWith: action.paidWith || 'manual' }
            : d
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

    case 'BUY_CREDITS': {
      const tx = {
        id: genId('ct'),
        type: 'purchase',
        amount: action.amount,
        date: new Date().toISOString(),
      }
      return {
        ...state,
        credits: parseFloat((state.credits + action.amount).toFixed(2)),
        creditTransactions: [tx, ...state.creditTransactions],
      }
    }

    case 'SPEND_CREDITS': {
      if (state.credits < action.amount) return state
      const tx = {
        id: genId('ct'),
        type: 'spend',
        amount: action.amount,
        debtId: action.debtId || null,
        date: new Date().toISOString(),
      }
      return {
        ...state,
        credits: parseFloat((state.credits - action.amount).toFixed(2)),
        creditTransactions: [tx, ...state.creditTransactions],
      }
    }

    case 'SET_AVATAR':
      return { ...state, profileAvatar: action.avatar }

    case 'LOGIN':
      return { ...state, currentUserId: action.userId }

    case 'LOGOUT':
      return { ...state, currentUserId: null }

    case 'REGISTER_USER': {
      const newUser = action.user
      return {
        ...state,
        customUsers: [...state.customUsers, newUser],
        currentUserId: newUser.id,
      }
    }

    case 'UPDATE_PROFILE': {
      const id = action.userId || state.currentUserId
      if (!id) return state
      return {
        ...state,
        userOverrides: {
          ...state.userOverrides,
          [id]: { ...(state.userOverrides[id] || {}), ...action.changes },
        },
      }
    }

    default:
      return state
  }
}

export const genId = (prefix = 'x') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

export function buildDebts(expense) {
  return expense.splitBetween
    .filter(split => split.userId !== expense.paidBy && split.amount > 0)
    .map((split) => ({
      id: genId('d'),
      groupId: expense.groupId,
      expenseId: expense.id,
      fromUserId: split.userId,
      toUserId: expense.paidBy,
      amount: parseFloat(split.amount.toFixed(2)),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    }))
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('splitsnap_v1')
      if (!saved) return init
      const parsed = JSON.parse(saved)
      return { ...init, ...parsed }
    } catch {
      return init
    }
  })

  useEffect(() => {
    localStorage.setItem('splitsnap_v1', JSON.stringify(state))
  }, [state])

  const allUsers = [...seedUsers, ...state.customUsers].map(u => ({
    ...u,
    ...(state.userOverrides[u.id] || {}),
  }))

  const currentUser = state.currentUserId
    ? allUsers.find(u => u.id === state.currentUserId) || null
    : null

  return (
    <AppContext.Provider value={{ ...state, allUsers, currentUser, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
