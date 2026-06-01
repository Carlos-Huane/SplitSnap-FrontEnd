/**
 * ============================================================
 * DEBTS SERVICE — Llamadas API para gestión de deudas
 * ============================================================
 * * Responsabilidad: Comunicar con backend endpoints de deudas
 * GET /api/groups/{groupId}/debts
 * PUT /api/groups/{groupId}/debts/{debtId}/mark-paid
 * PUT /api/groups/{groupId}/debts/{debtId}/pay-credits
 */

import { getAuthHeaders } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Obtener deudas de un grupo por estado
 * @param {string} groupId - ID del grupo
 * @param {string} status - 'PENDING' o 'PAID'
 * @returns {Promise<Array>} Lista de deudas
 */
export const getDebts = async (groupId, status) => {
  const response = await fetch(`${API_URL}/groups/${groupId}/debts?status=${status}`, {
    method: 'GET',
    headers: getAuthHeaders(), // Usamos tu función centralizada
  });

  if (!response.ok) {
    // Manejo especial para el 403 requerido por la HU
    if (response.status === 403) {
      throw new Error('403');
    }
    
    // Para otros errores (400, 500) leemos el body
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error obteniendo deudas');
  }

  return response.json();
};

/**
 * Marcar deuda como pagada (manual)
 * @param {string} groupId - ID del grupo
 * @param {string} debtId - ID de la deuda
 * @param {string} paidWith - Método de pago ('yape', 'paypal', 'efectivo')
 * @returns {Promise<Object>}
 */
export const markDebtAsPaid = async (groupId, debtId, paidWith) => {
  const response = await fetch(`${API_URL}/groups/${groupId}/debts/${debtId}/mark-paid`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ paidWith }),
  });

  if (!response.ok) {
    // Manejo de errores específicos según HU-F5.2
    if (response.status === 403) throw new Error('403');
    if (response.status === 409) throw new Error('409');
    
    // Para otros errores
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al marcar la deuda como pagada');
  }

  return response.json();
};

export const payDebtWithCredits = async (groupId, debtId) => {
  // Se implementará en HU-F5.3
}