import { createContext, useContext, useReducer, useEffect } from 'react'
import { users as seedUsers } from '../data/global'
import {
  getToken,
  setToken as persistToken,
  clearToken,
  isAuthenticated,
  getCurrentUserFromToken,
} from '../services/auth.service'

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

    case 'LOGIN': {
      // Soporta dos formatos para compatibilidad durante migracion:
      //  - viejo (mock): { userId }
      //  - nuevo (backend): { userId, user, token } donde user trae { id, name, email, phone? }
      if (action.token) persistToken(action.token)
      const customUsers = action.user
        ? upsertUser(state.customUsers, action.user)
        : state.customUsers
      return {
        ...state,
        currentUserId: action.userId,
        customUsers,
      }
    }

    case 'LOGOUT':
      clearToken()
      return { ...state, currentUserId: null }

    case 'REGISTER_USER': {
      // Soporta dos formatos:
      //  - viejo (mock): { user }  -> user creado localmente con id propio
      //  - nuevo (backend): { user, token } donde user.id viene del backend
      if (action.token) persistToken(action.token)
      const newUser = action.user
      return {
        ...state,
        customUsers: upsertUser(state.customUsers, newUser),
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

function upsertUser(list, user) {
  if (!user || !user.id) return list
  const exists = list.some(u => u.id === user.id)
  if (exists) return list.map(u => (u.id === user.id ? { ...u, ...user } : u))
  return [...list, user]
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
      const base = saved ? { ...init, ...JSON.parse(saved) } : init

      // Si hay un token valido pero no hay currentUserId, intentar recuperar del JWT.
      if (!base.currentUserId && isAuthenticated()) {
        const fromToken = getCurrentUserFromToken()
        if (fromToken) {
          return {
            ...base,
            currentUserId: fromToken.id,
            customUsers: upsertUser(base.customUsers || [], fromToken),
          }
        }
      }

      // Si hay currentUserId pero el token expiro -> limpiar sesion
      if (base.currentUserId && getToken() && !isAuthenticated()) {
        return { ...base, currentUserId: null }
      }

      return base
    } catch {
      return init
    }
  })

  useEffect(() => {
    localStorage.setItem('splitsnap_v1', JSON.stringify(state))
  }, [state])

  // Si el backend devolvio 401 (token invalido/expirado) -> auto-logout
  useEffect(() => {
    const handler = () => dispatch({ type: 'LOGOUT' })
    window.addEventListener('auth:expired', handler)
    return () => window.removeEventListener('auth:expired', handler)
  }, [])

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
