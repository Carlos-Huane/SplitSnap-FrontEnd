import React, { useState } from 'react';
import './DebtSummary.css'; // O un CSS específico para el modal si prefieres

function MarkAsPaidModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  const [paidWith, setPaidWith] = useState('efectivo');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Marcar deuda como pagada</h2>
        <p>¿Con qué método saldaste esta deuda?</p>
        
        <select 
          className="modal-select"
          value={paidWith} 
          onChange={(e) => setPaidWith(e.target.value)}
          disabled={isSubmitting}
        >
          <option value="yape">Yape</option>
          <option value="paypal">PayPal</option>
          <option value="efectivo">Efectivo</option>
        </select>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="modal-btn-confirm" onClick={() => onConfirm(paidWith)} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MarkAsPaidModal;