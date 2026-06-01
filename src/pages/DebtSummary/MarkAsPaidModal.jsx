import { useState } from 'react'
import './DebtSummary.css'

const METHODS = [
  { value: 'yape',     label: 'Yape',     emoji: '📱' },
  { value: 'paypal',   label: 'PayPal',   emoji: '🅿️' },
  { value: 'efectivo', label: 'Efectivo', emoji: '💵' },
]

function MarkAsPaidModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  const [paidWith, setPaidWith] = useState('efectivo')

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-paid-title"
      >
        <h2 id="mark-paid-title">Marcar deuda como pagada</h2>
        <p>¿Con qué método saldaste esta deuda?</p>

        <div className="mark-paid__methods">
          {METHODS.map((m) => (
            <label
              key={m.value}
              className={`mark-paid__method ${paidWith === m.value ? 'is-active' : ''}`}
            >
              <input
                type="radio"
                name="paidWith"
                value={m.value}
                checked={paidWith === m.value}
                onChange={(e) => setPaidWith(e.target.value)}
                disabled={isSubmitting}
              />
              <span className="mark-paid__method-emoji">{m.emoji}</span>
              <span className="mark-paid__method-label">{m.label}</span>
            </label>
          ))}
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            className="modal-btn-confirm"
            onClick={() => onConfirm(paidWith)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarkAsPaidModal
