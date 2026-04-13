import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { users, currentUser } from '../data/global'
import './DebtSummary.css'

function DebtSummary() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { groups, expenses, debts, dispatch } = useApp()

  const group = groups.find(g => g.id === id)
  const groupDebts = debts.filter(d => d.groupId === id)
  const groupExpenses = expenses.filter(e => e.groupId === id)

  const groupTotal = groupExpenses.reduce((sum, e) => sum + e.amount, 0)
  const memberCount = group?.memberIds.length || 0

  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const markAsPaid = (debtId) => {
    dispatch({ type: 'MARK_DEBT_PAID', debtId })
  }

  const pendingDebts = groupDebts.filter(d => d.status !== 'paid')
  const paidDebts = groupDebts.filter(d => d.status === 'paid')

  const getUser = (uid) => users.find(u => u.id === uid)
  const getName = (uid) => {
    const u = getUser(uid)
    if (!u) return 'Desconocido'
    return uid === currentUser.id ? 'Tú' : u.name.split(' ')[0]
  }
  const getInitial = (uid) => getUser(uid)?.name?.charAt(0).toUpperCase() || '?'
  const avatarColors = { u1: '#F97316', u2: '#3B82F6', u3: '#22C55E', u4: '#8B5CF6', u5: '#EF4444' }
  const getAvatarColor = (uid) => {
    if (avatarColors[uid]) return avatarColors[uid]
    // Para IDs generados dinámicamente, hashear el string
    let hash = 0
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash)
    const colors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="debt-summary">
      {/* Toast notification */}
      {toast && (
        <div className="debt-summary__toast">
          {toast}
        </div>
      )}

      <div className="debt-summary__header">
        <button className="debt-summary__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="debt-summary__title">Resumen de deudas</h1>
      </div>

      {/* Balance total card */}
      <div className="debt-summary__balance-card">
        <p className="debt-summary__balance-label">Balance total del grupo</p>
        <p className="debt-summary__balance-amount">
          ${groupTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="debt-summary__group-name">{group?.emoji} {group?.name || 'Grupo'}</p>
        <span className="debt-summary__member-badge">{memberCount} miembro{memberCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Two-column layout on desktop */}
      <div className="debt-summary__columns">
        {/* Pending debts */}
        {pendingDebts.length > 0 && (
          <section className="debt-summary__section">
            <h2 className="debt-summary__section-title">Deudas pendientes</h2>
            <div className="debt-summary__debts">
              {pendingDebts.map(debt => (
                <div key={debt.id} className="debt-card">
                  <div className="debt-card__row">
                    <div className="debt-card__users">
                      <div
                        className="debt-card__avatar"
                        style={{ background: getAvatarColor(debt.fromUserId) }}
                      >
                        {getInitial(debt.fromUserId)}
                      </div>
                      <span className="debt-card__arrow">→</span>
                      <div
                        className="debt-card__avatar"
                        style={{ background: getAvatarColor(debt.toUserId) }}
                      >
                        {getInitial(debt.toUserId)}
                      </div>
                      <span className="debt-card__names">
                        {getName(debt.fromUserId)} → {getName(debt.toUserId)}
                      </span>
                    </div>
                    <span className="debt-card__amount">${debt.amount.toFixed(2)}</span>
                  </div>

                  <div className="debt-card__actions">
                    <button
                      className="debt-card__pay-btn debt-card__pay-btn--paypal"
                      onClick={() => showToast('💳 PayPal no disponible aún. ¡Próximamente!')}
                    >
                      💳 PayPal
                    </button>
                    <button
                      className="debt-card__pay-btn debt-card__pay-btn--venmo"
                      onClick={() => showToast('📲 Venmo no disponible aún. ¡Próximamente!')}
                    >
                      📲 Venmo
                    </button>
                  </div>

                  <button
                    className="debt-card__mark-paid"
                    onClick={() => markAsPaid(debt.id)}
                  >
                    ☑ Marcar como pagado
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Paid debts */}
        {paidDebts.length > 0 && (
          <section className="debt-summary__section">
            <h2 className="debt-summary__section-title">Deudas saldadas</h2>
            <div className="debt-summary__debts">
              {paidDebts.map(debt => (
                <div key={debt.id} className="debt-card debt-card--paid">
                  <div className="debt-card__row">
                    <div className="debt-card__users">
                      <div
                        className="debt-card__avatar debt-card__avatar--paid"
                        style={{ background: getAvatarColor(debt.fromUserId) }}
                      >
                        {getInitial(debt.fromUserId)}
                      </div>
                      <span className="debt-card__arrow">→</span>
                      <div
                        className="debt-card__avatar debt-card__avatar--paid"
                        style={{ background: getAvatarColor(debt.toUserId) }}
                      >
                        {getInitial(debt.toUserId)}
                      </div>
                      <span className="debt-card__names debt-card__names--paid">
                        {getName(debt.fromUserId)} → {getName(debt.toUserId)}
                      </span>
                    </div>
                    <div className="debt-card__paid-badge">
                      <span className="debt-card__amount debt-card__amount--paid">
                        ${debt.amount.toFixed(2)}
                      </span>
                      <span className="debt-card__paid-label">Pagado</span>
                    </div>
                  </div>
                  <p className="debt-card__paid-check">✓ Deuda saldada</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Estado vacío */}
      {groupDebts.length === 0 && (
        <div className="debt-summary__all-paid">
          <span>📋</span>
          <p>No hay deudas en este grupo aún</p>
        </div>
      )}

      {pendingDebts.length === 0 && paidDebts.length > 0 && (
        <div className="debt-summary__all-paid">
          <span>🎉</span>
          <p>¡Todas las deudas están saldadas!</p>
        </div>
      )}
    </div>
  )
}

export default DebtSummary
