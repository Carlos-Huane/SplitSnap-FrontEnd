/**
 * ============================================================
 * AUTH SERVICE — Llamadas API para autenticación
 * ============================================================
 * 
 * Responsabilidad: Comunicar con backend endpoints de auth
 * POST /api/auth/register
 * POST /api/auth/login
 * 
 * Retorna: Token JWT + usuario info
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Registrar nuevo usuario
 * @param {Object} data - { name, email, phone, password }
 * @returns {Promise<{token, user}>}
 */
export const register = async (data) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en registro');
  }

  return response.json();
};

/**
 * Iniciar sesión
 * @param {Object} data - { email, password }
 * @returns {Promise<{token, user}>}
 */
export const login = async (data) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en login');
  }

  return response.json();
};

/**
 * Guardar token en localStorage
 */
export const saveToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Obtener token desde localStorage
 */
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Obtener headers con autenticación
 */
export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

/**
 * Obtener perfil del usuario autenticado
 */
export const getProfile = async () => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Error obteniendo perfil');
  }

  return response.json();
};

/**
 * Eliminar token de localStorage
 */
export const clearToken = () => {
  localStorage.removeItem('auth_token');
};

/**
 * Verificar si hay sesión activa
 */
export const isAuthenticated = () => {
  return !!getToken();
};
