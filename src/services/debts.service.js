import api from './api'

/**
 * Servicio del dominio Debts.
 * Responsable: Dafne Fuentes (epica F5)
 *
 * Endpoints disponibles en el backend:
 *   GET    /api/groups/{groupId}/debts?status=<PENDING|PAID>             -> listar deudas
 *   PUT    /api/groups/{groupId}/debts/{debtId}/mark-paid                -> marcar pagada manual
 *   PUT    /api/groups/{groupId}/debts/{debtId}/pay-credits              -> pagar con creditos
 */

export async function getDebts(groupId, status) {
  const params = status ? { status } : {}
  const { data } = await api.get(`/api/groups/${groupId}/debts`, { params })
  return data
}

export async function markAsPaid(groupId, debtId, paidWith) {
  // paidWith: "yape" | "paypal" | "efectivo"
  const { data } = await api.put(
    `/api/groups/${groupId}/debts/${debtId}/mark-paid`,
    { paidWith }
  )
  return data
}

export async function payWithCredits(groupId, debtId) {
  const { data } = await api.put(
    `/api/groups/${groupId}/debts/${debtId}/pay-credits`
  )
  return data
}
