import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './DebtSummary.css'

function DebtSummary() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { groups, expenses, debts, credits, allUsers, currentUser, dispatch } = useApp()
  const users = allUsers

  const group = groups.find(g => g.id === id)
  const groupDebts = debts.filter(d => d.groupId === id)
  const groupExpenses = expenses.filter(e => e.groupId === id)

  const groupTotal = groupExpenses.reduce((sum, e) => sum + e.amount, 0)
  const memberCount = group?.memberIds.length || 0

  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('gastos')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const markAsPaid = (debtId) => dispatch({ type: 'MARK_DEBT_PAID', debtId })

  const payWithCredits = (debt) => {
    if (credits < debt.amount) {
      showToast(`Créditos insuficientes. Te faltan S/ ${(debt.amount - credits).toFixed(2)}. Compra más en tu Perfil.`)
      return
    }
    dispatch({ type: 'SPEND_CREDITS', amount: debt.amount, debtId: debt.id })
    dispatch({ type: 'MARK_DEBT_PAID', debtId: debt.id, paidWith: 'credits' })
    showToast(`✓ Pago de S/${debt.amount.toFixed(2)} registrado con créditos SplitSnap`)
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
  const getAvatarColor = (uid) => {
    const palette = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
    const fixed = { u1: palette[0], u2: palette[1], u3: palette[2], u4: palette[3], u5: palette[4] }
    if (fixed[uid]) return fixed[uid]
    let hash = 0
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
  }

  const formatDate = (d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })

  // Balance neto por persona (solo deudas pendientes)
  const memberBalances = (group?.memberIds || []).map(uid => {
    const owed = pendingDebts.filter(d => d.toUserId === uid).reduce((s, d) => s + d.amount, 0)
    const owes = pendingDebts.filter(d => d.fromUserId === uid).reduce((s, d) => s + d.amount, 0)
    return { uid, net: owed - owes }
  })

  // Agrupar deudas pendientes por gasto (solo las que tienen expenseId)
  const expenseGroups = groupExpenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(expense => ({
      expense,
      debts: pendingDebts.filter(d => d.expenseId === expense.id),
    }))
    .filter(g => g.debts.length > 0)

  // Deudas sin expenseId (compatibilidad hacia atrás)
  const orphanDebts = pendingDebts.filter(d => !d.expenseId)

  // Tarjeta de deuda reutilizable
  const DebtCard = ({ debt, showExpense = false }) => {
    const exp = showExpense ? groupExpenses.find(e => e.id === debt.expenseId) : null
    return (
      <div className="debt-card">
        <div className="debt-card__row">
          <div className="debt-card__users">
            <div className="debt-card__avatar" style={{ background: getAvatarColor(debt.fromUserId) }}>
              {getInitial(debt.fromUserId)}
            </div>
            <span className="debt-card__arrow">→</span>
            <div className="debt-card__avatar" style={{ background: getAvatarColor(debt.toUserId) }}>
              {getInitial(debt.toUserId)}
            </div>
            <div className="debt-card__names-wrap">
              <span className="debt-card__names">
                {getName(debt.fromUserId)} debe a {getName(debt.toUserId)}
              </span>
              {exp && (
                <span className="debt-card__origin">
                  📌 {exp.description} · {formatDate(exp.date)}
                </span>
              )}
            </div>
          </div>
          <span className="debt-card__amount">S/{debt.amount.toFixed(2)}</span>
        </div>

        <div className="debt-card__actions">
          <button
            className="debt-card__pay-btn debt-card__pay-btn--credits"
            onClick={() => payWithCredits(debt)}
            disabled={credits < debt.amount}
            title={credits < debt.amount ? 'Créditos insuficientes' : 'Pagar con créditos SplitSnap'}
          >
            💰 Pagar con créditos SplitSnap · S/{debt.amount.toFixed(2)}
          </button>
        </div>
        <p className="debt-card__credits-hint">
          Saldo: {credits.toFixed(2)} créditos
          {credits < debt.amount && ' · Compra más en tu Perfil'}
        </p>
        <button className="debt-card__mark-paid" onClick={() => markAsPaid(debt.id)}>
          ☑ Marcar como pagado (efectivo / otro)
        </button>
      </div>
    )
  }

  return (
    <div className="debt-summary">
      {toast && <div className="debt-summary__toast">{toast}</div>}

      <div className="debt-summary__header">
        <button className="debt-summary__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="debt-summary__title">Resumen de deudas</h1>
      </div>

      {/* Balance card */}
      <div className="debt-summary__balance-card">
        <p className="debt-summary__balance-label">Gasto total del grupo</p>
        <p className="debt-summary__balance-amount">
          S/{groupTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="debt-summary__group-name">{group?.emoji} {group?.name || 'Grupo'}</p>
        <span className="debt-summary__member-badge">
          {memberCount} miembro{memberCount !== 1 ? 's' : ''} · {groupExpenses.length} gasto{groupExpenses.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Balance por persona */}
      {memberBalances.some(b => b.net !== 0) && (
        <div className="debt-summary__balances">
          <p className="debt-summary__balances-label">Balance pendiente por persona</p>
          <div className="debt-summary__balances-row">
            {memberBalances.map(({ uid, net }) => (
              <div key={uid} className={`balance-pill ${net > 0 ? 'balance-pill--positive' : net < 0 ? 'balance-pill--negative' : ''}`}>
                <div className="balance-pill__avatar" style={{ background: getAvatarColor(uid) }}>
                  {getInitial(uid)}
                </div>
                <div className="balance-pill__info">
                  <span className="balance-pill__name">{getName(uid)}</span>
                  <span className="balance-pill__amount">
                    {net > 0 ? `Le deben S/${net.toFixed(2)}` : net < 0 ? `Debe S/${Math.abs(net).toFixed(2)}` : 'En paz ✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {groupDebts.length === 0 ? (
        <div className="debt-summary__all-paid">
          <span>📋</span>
          <p>No hay deudas en este grupo aún</p>
        </div>
      ) : (
        <div className="debt-summary__body">
          {pendingDebts.length > 0 && (
            <>
              {/* Tabs */}
              <div className="debt-summary__tabs">
                <button
                  className={`debt-summary__tab ${activeTab === 'gastos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('gastos')}
                >
                  📋 Por gasto
                </button>
                <button
                  className={`debt-summary__tab ${activeTab === 'persona' ? 'active' : ''}`}
                  onClick={() => setActiveTab('persona')}
                >
                  👤 Por persona
                </button>
              </div>

              {/* Tab: Por gasto */}
              {activeTab === 'gastos' && (
                <div className="debt-summary__tab-pane">
                  {expenseGroups.map(({ expense, debts: eds }) => (
                    <div key={expense.id} className="expense-group">
                      <div className="expense-group__header">
                        <div className="expense-group__info">
                          <p className="expense-group__name">{expense.description}</p>
                          <p className="expense-group__meta">
                            {formatDate(expense.date)} · pagado por {getName(expense.paidBy)}
                          </p>
                        </div>
                        <span className="expense-group__total">S/{expense.amount.toFixed(2)}</span>
                      </div>
                      <div className="expense-group__debts">
                        {eds.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                      </div>
                    </div>
                  ))}
                  {orphanDebts.length > 0 && (
                    <div className="expense-group">
                      <div className="expense-group__header">
                        <p className="expense-group__name">Otras deudas</p>
                      </div>
                      <div className="expense-group__debts">
                        {orphanDebts.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Por persona */}
              {activeTab === 'persona' && (
                <div className="debt-summary__tab-pane">
                  {(group?.memberIds || []).map(uid => {
                    const myDebts = pendingDebts.filter(
                      d => d.fromUserId === uid || d.toUserId === uid
                    )
                    if (myDebts.length === 0) return null
                    const owes = myDebts.filter(d => d.fromUserId === uid).reduce((s, d) => s + d.amount, 0)
                    const owed = myDebts.filter(d => d.toUserId === uid).reduce((s, d) => s + d.amount, 0)
                    return (
                      <div key={uid} className="person-group">
                        <div className="person-group__header">
                          <div className="person-group__avatar" style={{ background: getAvatarColor(uid) }}>
                            {getInitial(uid)}
                          </div>
                          <div>
                            <p className="person-group__name">{getName(uid)}</p>
                            <p className="person-group__meta">
                              {owes > 0 && <span className="person-group__owes">Debe S/{owes.toFixed(2)}</span>}
                              {owes > 0 && owed > 0 && ' · '}
                              {owed > 0 && <span className="person-group__owed">Le deben S/{owed.toFixed(2)}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="person-group__debts">
                          {myDebts.map(debt => <DebtCard key={debt.id} debt={debt} showExpense />)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Deudas saldadas */}
          {paidDebts.length > 0 && (
            <section className="debt-summary__section debt-summary__section--paid">
              <h2 className="debt-summary__section-title">
                Saldadas ({paidDebts.length})
              </h2>
              <div className="debt-summary__debts">
                {paidDebts.map(debt => {
                  const exp = groupExpenses.find(e => e.id === debt.expenseId)
                  return (
                    <div key={debt.id} className="debt-card debt-card--paid">
                      <div className="debt-card__row">
                        <div className="debt-card__users">
                          <div className="debt-card__avatar debt-card__avatar--paid" style={{ background: getAvatarColor(debt.fromUserId) }}>
                            {getInitial(debt.fromUserId)}
                          </div>
                          <span className="debt-card__arrow">→</span>
                          <div className="debt-card__avatar debt-card__avatar--paid" style={{ background: getAvatarColor(debt.toUserId) }}>
                            {getInitial(debt.toUserId)}
                          </div>
                          <div className="debt-card__names-wrap">
                            <span className="debt-card__names debt-card__names--paid">
                              {getName(debt.fromUserId)} → {getName(debt.toUserId)}
                            </span>
                            {exp && (
                              <span className="debt-card__origin debt-card__origin--paid">
                                {exp.description} · {formatDate(exp.date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="debt-card__paid-badge">
                          <span className="debt-card__amount debt-card__amount--paid">
                            S/{debt.amount.toFixed(2)}
                          </span>
                          <span className="debt-card__paid-label">✓ Pagado</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {pendingDebts.length === 0 && paidDebts.length > 0 && (
            <div className="debt-summary__all-paid">
              <span>🎉</span>
              <p>¡Todas las deudas están saldadas!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DebtSummary
