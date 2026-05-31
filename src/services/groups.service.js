import api from './api'

/**
 * Servicio del dominio Groups.
 * Responsable: Obed Velarde (epica F2)
 *
 * Endpoints disponibles en el backend:
 *   GET    /api/groups                          -> mis grupos
 *   POST   /api/groups                          -> crear grupo
 *   GET    /api/groups/{groupId}                -> detalle de un grupo
 *   POST   /api/groups/{groupId}/members        -> agregar miembro
 *   DELETE /api/groups/{groupId}/members/{userId} -> remover miembro
 */

export async function getMyGroups() {
  const { data } = await api.get('/api/groups')
  return data
}

export async function createGroup(payload) {
  // payload: { name, emoji?, memberIds: string[] }
  const { data } = await api.post('/api/groups', payload)
  return data
}

export async function getGroup(groupId) {
  const { data } = await api.get(`/api/groups/${groupId}`)
  return data
}

export async function addMember(groupId, userId) {
  const { data } = await api.post(`/api/groups/${groupId}/members`, { userId })
  return data
}

export async function removeMember(groupId, userId) {
  await api.delete(`/api/groups/${groupId}/members/${userId}`)
}
