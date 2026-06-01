import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DebtSummary.css';

function PayWithCreditsModal({ isOpen, onClose, onConfirm, isSubmitting, debt, currentCredits }) {
  const navigate = useNavigate();
  
  if (!isOpen || !debt) return null;

  const hasEnoughCredits = currentCredits >= debt.amount;
  const balanceNeto = currentCredits - debt.amount;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '350px' }}>
        <h2>Pagar con Créditos</h2>
        
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
          <p style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
            <span>Tu balance actual:</span>
            <strong>{currentCredits.toFixed(2)} cr.</strong>
          </p>
          <p style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0', color: '#ef4444' }}>
            <span>Monto a pagar:</span>
            <strong>- S/{debt.amount.toFixed(2)}</strong>
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0' }} />
          <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0' }}>
            <span>Balance final:</span>
            <strong style={{ color: hasEnoughCredits ? '#22c55e' : '#ef4444' }}>
              {balanceNeto.toFixed(2)} cr.
            </strong>
          </p>
        </div>

        {!hasEnoughCredits && (
          <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>
            Créditos insuficientes. Te faltan {Math.abs(balanceNeto).toFixed(2)} créditos.
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          
          {/* Si tiene créditos, muestra botón de confirmar. Si no, botón para ir al perfil */}
          {hasEnoughCredits ? (
            <button className="modal-btn-confirm" onClick={() => onConfirm(debt.id)} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          ) : (
            <button className="modal-btn-confirm" onClick={() => navigate('/profile')} style={{ background: '#f97316' }}>
              Comprar más
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PayWithCreditsModal;