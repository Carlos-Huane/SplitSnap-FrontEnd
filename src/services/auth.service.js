import api, { setToken, clearToken, getToken } from './api'

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, phone?: string, password: string }} payload
 * @returns {Promise<{ token: string, user: { id, name, email, phone? } }>}
 */
export async function register(payload) {
  const { data } = await api.post('/api/auth/register', payload)
  if (data?.token) setToken(data.token)
  return data
}

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: { id, name, email } }>}
 */
export async function login(payload) {
  const { data } = await api.post('/api/auth/login', payload)
  if (data?.token) setToken(data.token)
  return data
}

/**
 * Limpia el token local. No llama al backend porque el JWT es stateless.
 */
export function logout() {
  clearToken()
}

export { getToken, setToken, clearToken }

/**
 * Decodifica el payload de un JWT (sin verificar firma).
 * Util para leer email/name del usuario actual sin llamar al backend.
 * @returns {object|null}
 */
export function decodeToken() {
  const token = getToken()
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Devuelve true si hay un token presente y no ha expirado.
 * @returns {boolean}
 */
export function isAuthenticated() {
  const claims = decodeToken()
  if (!claims) return false
  if (claims.exp && Date.now() / 1000 > claims.exp) {
    clearToken()
    return false
  }
  return true
}

/**
 * Devuelve los datos basicos del usuario autenticado a partir del JWT.
 * El backend incluye id (sub), email y name en los claims.
 * @returns {{ id, email, name } | null}
 */
export function getCurrentUserFromToken() {
  const claims = decodeToken()
  if (!claims) return null
  return {
    id: claims.sub,
    email: claims.email,
    name: claims.name,
  }
}
