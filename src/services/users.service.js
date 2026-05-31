import api from './api'

/**
 * Servicio del dominio Users.
 * Responsable: Marcela (epica F1)
 *
 * Endpoints disponibles en el backend:
 *   GET    /api/users/me                  -> datos del usuario autenticado
 *   PUT    /api/users/me                  -> actualizar perfil
 *   PUT    /api/users/me/avatar           -> subir avatar (multipart/form-data)
 *   GET    /api/users/search?q=<query>    -> buscar usuarios por nombre/email
 */

export async function getMe() {
  const { data } = await api.get('/api/users/me')
  return data
}

export async function updateMe(payload) {
  // payload: { name?, email?, phone?, currentPassword?, newPassword? }
  const { data } = await api.put('/api/users/me', payload)
  return data
}

export async function uploadAvatar(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.put('/api/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function search(query) {
  const { data } = await api.get('/api/users/search', { params: { q: query } })
  return data
}
