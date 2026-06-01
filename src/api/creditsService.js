/**
 * ============================================================
 * CREDITS SERVICE — Llamadas API para sistema de créditos
 * ============================================================
 * 
 * Responsabilidad: Comunicar con backend endpoints de créditos
 * GET /api/users/me/credits
 * POST /api/users/me/credits/buy
 */

import { getAuthHeaders } from './userService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Obtener información de créditos del usuario
 * @returns {Promise<{balance, transactions}>}
 */
export const getCredits = async () => {
  const response = await fetch(`${API_URL}/users/me/credits`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error obteniendo créditos');
  }

  return response.json();
};

/**
 * Comprar créditos
 * @param {number} amount - Cantidad de créditos a comprar
 * @returns {Promise<{message, newBalance}>}
 */
export const buyCredits = async (amount) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('El monto debe ser un número entero mayor a 0');
  }

  const response = await fetch(`${API_URL}/users/me/credits/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error comprando créditos');
  }

  return response.json();
};
