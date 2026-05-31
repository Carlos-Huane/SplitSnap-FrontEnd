import api from './api'

/**
 * Servicio del dominio Expenses + OCR.
 * Responsable: Yorma Campos (epica F3 - manuales) y Carlos Huane (epica F4 - OCR).
 *
 * Endpoints disponibles en el backend:
 *   GET    /api/groups/{groupId}/expenses                  -> listar gastos del grupo
 *   POST   /api/groups/{groupId}/expenses                  -> registrar gasto manual
 *   GET    /api/groups/{groupId}/expenses/{expenseId}      -> detalle de un gasto
 *   POST   /api/ocr/scan                                   -> escanear recibo (multipart/form-data)
 */

export async function getExpensesByGroup(groupId) {
  const { data } = await api.get(`/api/groups/${groupId}/expenses`)
  return data
}

export async function getExpenseDetail(groupId, expenseId) {
  const { data } = await api.get(`/api/groups/${groupId}/expenses/${expenseId}`)
  return data
}

export async function createExpense(groupId, payload) {
  // payload: { description, amount, paidBy?, date?, splitBetween: [{userId, amount}, ...] }
  const { data } = await api.post(`/api/groups/${groupId}/expenses`, payload)
  return data
}

export async function scanReceipt(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/api/ocr/scan', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // OCR puede tardar mas que el default
  })
  return data
}
