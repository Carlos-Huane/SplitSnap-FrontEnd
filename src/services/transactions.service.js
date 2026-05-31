import api from './api'

/**
 * Servicio del dominio Transactions.
 * Responsable: (sin asignar - fuera del scope inicial del sprint)
 *
 * Endpoint disponible en el backend:
 *   GET    /api/users/me/transactions?groupId=<id>&type=<expense|payment>
 *
 * Nota: los filtros from/to NO estan implementados en el backend todavia.
 */

export async function getTransactions({ groupId, type } = {}) {
  const params = {}
  if (groupId) params.groupId = groupId
  if (type) params.type = type
  const { data } = await api.get('/api/users/me/transactions', { params })
  return data
}
