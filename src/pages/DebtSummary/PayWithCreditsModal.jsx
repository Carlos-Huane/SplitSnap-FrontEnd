import { useNavigate } from 'react-router-dom'
import './DebtSummary.css'

function PayWithCreditsModal({ isOpen, onClose, onConfirm, isSubmitting, debt, currentCredits }) {
  const navigate = useNavigate()

  if (!isOpen || !debt) return null

  const balance = Number(currentCredits) || 0
  const amount = Number(debt.amount) || 0
  const hasEnoughCredits = balance >= amount
  const balanceNeto = balance - amount

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content pay-credits"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-credits-title"
      >
        <h2 id="pay-credits-title">Pagar con créditos</h2>
        <p>Confirma el descuento de tu balance para saldar esta deuda.</p>

        <div className="pay-credits__summary">
          <div className="pay-credits__row">
            <span>Tu balance actual</span>
            <strong>{balance.toFixed(2)} cr.</strong>
          </div>
          <div className="pay-credits__row pay-credits__row--negative">
            <span>Monto a pagar</span>
            <strong>- S/ {amount.toFixed(2)}</strong>
          </div>
          <hr className="pay-credits__divider" />
          <div className={`pay-credits__row pay-credits__row--total ${hasEnoughCredits ? 'is-positive' : 'is-negative'}`}>
            <span>Balance final</span>
            <strong>{balanceNeto.toFixed(2)} cr.</strong>
          </div>
        </div>

        {!hasEnoughCredits && (
          <p className="pay-credits__warning">
            Créditos insuficientes. Te faltan {Math.abs(balanceNeto).toFixed(2)} créditos.
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          {hasEnoughCredits ? (
            <button className="modal-btn-confirm" onClick={() => onConfirm(debt.id)} disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Confirmar pago'}
            </button>
          ) : (
            <button className="modal-btn-confirm" onClick={() => navigate('/profile')}>
              Comprar créditos
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PayWithCreditsModal
