/**
 * ============================================================
 * USER SERVICE — Llamadas API para gestión de perfil
 * ============================================================
 * 
 * Responsabilidad: Comunicar con backend endpoints de usuario
 * GET /api/users/me
 * PUT /api/users/me
 * PUT /api/users/me/avatar
 */

import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Obtener headers con autenticación
 */
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
});

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise<UserResponse>}
 */
export const getProfile = async () => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error obteniendo perfil');
  }

  return response.json();
};

/**
 * Actualizar perfil del usuario
 * @param {Object} data - { name, email, phone, currentPassword, newPassword }
 * @returns {Promise<UserResponse>}
 */
export const updateProfile = async (data) => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error actualizando perfil');
  }

  return response.json();
};

/**
 * Subir avatar del usuario
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{avatarUrl}>}
 */
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error subiendo avatar');
  }

  return response.json();
};
