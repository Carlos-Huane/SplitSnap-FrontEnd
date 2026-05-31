import api from './api'

/**
 * Servicio del dominio Credits.
 * Responsable: Marcela (epica F1.4)
 *
 * Endpoints disponibles en el backend:
 *   GET    /api/users/me/credits          -> balance + historial de transacciones
 *   POST   /api/users/me/credits/buy      -> comprar creditos
 */

export async function getCredits() {
  const { data } = await api.get('/api/users/me/credits')
  return data
}

export async function buyCredits(amount) {
  const { data } = await api.post('/api/users/me/credits/buy', { amount })
  return data
}
