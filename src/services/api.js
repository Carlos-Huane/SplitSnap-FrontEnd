import axios from 'axios'

const TOKEN_KEY = 'splitsnap_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      window.dispatchEvent(
        new CustomEvent('app:network-error', {
          detail: { message: 'No se pudo conectar con el servidor. Verifica que el backend este corriendo.' },
        })
      )
      return Promise.reject(error)
    }

    const status = error.response.status

    if (status === 401) {
      clearToken()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(error)
  }
)

export const extractErrorMessage = (error, fallback = 'Ocurrio un error inesperado') => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return fallback
}

export default api
