import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getDebts, markAsPaid, payWithCredits } from '../../services/debts.service'
import { getGroup } from '../../services/groups.service'
import { getExpensesByGroup } from '../../services/expenses.service'
import { getCredits } from '../../services/credits.service'
import { extractErrorMessage } from '../../services/api'
import MarkAsPaidModal from './MarkAsPaidModal'
import PayWithCreditsModal from './PayWithCreditsModal'
import './DebtSummary.css'

function DebtSummary() {
  const navigate = useNavigate()
  const { id: groupId } = useParams()

  const { credits, currentUser } = useApp()

  // Grupo + gastos del backend (no del contexto mock)
  const [group, setGroup] = useState(null)
  const [groupExpenses, setGroupExpenses] = useState([])
  const groupTotalLocal = groupExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const memberCount = group?.memberCount ?? group?.members?.length ?? 0

  // --- ESTADOS LOCALES GENERALES ---
  const [debts, setDebts] = useState([])
  const [statusTab, setStatusTab] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState('')
  const [creditBalance, setCreditBalance] = useState(credits ?? 0)

  // --- ESTADOS PARA EL MODAL DE PAGO MANUAL (HU-F5.2) ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDebtId, setSelectedDebtId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- ESTADOS PARA EL MODAL DE CRÉDITOS (HU-F5.3) ---
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)
  const [debtToPay, setDebtToPay] = useState(null)
  const [isSubmittingCredit, setIsSubmittingCredit] = useState(false)

  // --- EFECTO: LLAMADA A LA API ---
  const fetchDebts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDebts(groupId, statusTab)

      const adaptedDebts = data.map(debt => ({
        ...debt,
        fromUserId: debt.fromUser?.id ?? debt.fromUserId,
        toUserId: debt.toUser?.id ?? debt.toUserId,
        fromUser: debt.fromUser,
        toUser: debt.toUser,
      }))

      setDebts(adaptedDebts)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('No tienes acceso a este grupo.')
      } else {
        setError(extractErrorMessage(err, 'Ocurrió un error al cargar las deudas.'))
      }
    } finally {
      setLoading(false)
    }
  }, [groupId, statusTab])

  useEffect(() => {
    if (groupId) fetchDebts()
  }, [fetchDebts])

  // Cargar el saldo real de créditos del backend (no del estado local mock)
  useEffect(() => {
    let cancelled = false
    getCredits()
      .then((data) => { if (!cancelled) setCreditBalance(data?.balance ?? 0) })
      .catch(() => { /* dejamos el fallback del context */ })
    return () => { cancelled = true }
  }, [])

  // Cargar grupo (header) y gastos (total) desde el backend
  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    Promise.all([
      getGroup(groupId).catch(() => null),
      getExpensesByGroup(groupId).catch(() => []),
    ]).then(([g, exps]) => {
      if (cancelled) return
      setGroup(g)
      setGroupExpenses(exps || [])
    })
    return () => { cancelled = true }
  }, [groupId])

  // --- FUNCIONES AUXILIARES ---
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // --- LÓGICA DE PAGO MANUAL (HU-F5.2) ---
  const handleOpenModal = (debtId) => {
    setSelectedDebtId(debtId)
    setIsModalOpen(true)
  }

  const handleConfirmMarkPaid = async (paidWith) => {
    setIsSubmitting(true)
    try {
      await markAsPaid(groupId, selectedDebtId, paidWith)
      showToast('✓ Deuda marcada como pagada')
      setIsModalOpen(false)
      fetchDebts()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        alert('Solo el deudor puede marcar esta deuda como pagada.')
      } else if (status === 409) {
        alert('Esta deuda ya estaba pagada.')
        setIsModalOpen(false)
        fetchDebts()
      } else {
        alert(extractErrorMessage(err, 'No pudimos marcar la deuda como pagada.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- LÓGICA DE PAGO CON CRÉDITOS (HU-F5.3) ---
  const handleOpenCreditModal = (debt) => {
    setDebtToPay(debt)
    setIsCreditModalOpen(true)
  }

  const handleConfirmPayCredits = async (debtId) => {
    setIsSubmittingCredit(true)
    try {
      await payWithCredits(groupId, debtId)
      showToast('✓ Pago de deuda exitoso usando créditos')

      // Releer balance real desde el backend
      try {
        const refreshed = await getCredits()
        setCreditBalance(refreshed?.balance ?? 0)
      } catch { /* no-op */ }

      setIsCreditModalOpen(false)
      fetchDebts()
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''
      if (status === 400 && /insuficient/i.test(msg)) {
        alert('No tienes suficientes créditos. Serás redirigido a tu perfil para comprar.')
        navigate('/profile')
      } else if (status === 403) {
        alert('Solo el deudor puede pagar esta deuda.')
      } else if (status === 409) {
        alert('Esta deuda ya estaba pagada.')
        setIsCreditModalOpen(false)
        fetchDebts()
      } else {
        alert(extractErrorMessage(err, 'No pudimos procesar el pago.'))
      }
    } finally {
      setIsSubmittingCredit(false)
    }
  }

  // Visuales
  const getName = (userObj) => {
    if (!userObj) return 'Desconocido'
    return userObj.id === currentUser?.id ? 'Tú' : (userObj.name?.split(' ')[0] || 'Usuario')
  }
  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'
  
  const getAvatarColor = (uid) => {
    const palette = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
    let hash = 0
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
  }

  // Soporta ambos shapes: memberIds (mock) y members[] (backend)
  const memberIdsForBalances =
    group?.memberIds ?? (group?.members || []).map(m => m.id ?? m.userId)
  const memberBalances = statusTab === 'PENDING'
    ? memberIdsForBalances.map(uid => {
        const owed = debts.filter(d => d.toUserId === uid).reduce((s, d) => s + (Number(d.amount) || 0), 0)
        const owes = debts.filter(d => d.fromUserId === uid).reduce((s, d) => s + (Number(d.amount) || 0), 0)
        return { uid, net: owed - owes }
      })
    : []

  // --- COMPONENTE DE TARJETA ---
  const DebtCard = ({ debt }) => {
    const isPaid = statusTab === 'PAID'
    const isDebtor = debt.fromUserId === currentUser?.id
    const debtAmount = Number(debt.amount) || 0

    return (
      <div className={`debt-card ${isPaid ? 'debt-card--paid' : ''}`}>
        <div className="debt-card__row">
          <div className="debt-card__users">
            <div className={`debt-card__avatar ${isPaid ? 'debt-card__avatar--paid' : ''}`} style={{ background: getAvatarColor(debt.fromUserId) }}>
              {getInitial(debt.fromUser?.name)}
            </div>
            <span className="debt-card__arrow">→</span>
            <div className={`debt-card__avatar ${isPaid ? 'debt-card__avatar--paid' : ''}`} style={{ background: getAvatarColor(debt.toUserId) }}>
              {getInitial(debt.toUser?.name)}
            </div>
            <div className="debt-card__names-wrap">
              <span className={`debt-card__names ${isPaid ? 'debt-card__names--paid' : ''}`}>
                {getName(debt.fromUser)} {isPaid ? '→' : 'debe a'} {getName(debt.toUser)}
              </span>
            </div>
          </div>
          
          {isPaid ? (
             <div className="debt-card__paid-badge">
               <span className="debt-card__amount debt-card__amount--paid">S/{debtAmount.toFixed(2)}</span>
               <span className="debt-card__paid-label">✓ Pagado</span>
             </div>
          ) : (
            <span className="debt-card__amount">S/{debtAmount.toFixed(2)}</span>
          )}
        </div>

        {!isPaid && (
          <>
            <div className="debt-card__actions">
              {isDebtor && (
                <button
                  className="debt-card__pay-btn debt-card__pay-btn--credits"
                  onClick={() => handleOpenCreditModal(debt)}
                >
                  💰 Pagar con créditos · S/{debtAmount.toFixed(2)}
                </button>
              )}
            </div>
            
            {isDebtor ? (
              <>
                <p className="debt-card__credits-hint">
                  Saldo: {creditBalance.toFixed(2)} créditos
                </p>
                <button className="debt-card__mark-paid" onClick={() => handleOpenModal(debt.id)}>
                  ☑ Marcar como pagado (manual)
                </button>
              </>
            ) : (
              <p className="debt-card__waiting-text" style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                Esperando el pago de {getName(debt.fromUser)}...
              </p>
            )}
          </>
        )}
      </div>
    )
  }

  if (error === 'No tienes acceso a este grupo.') {
    return (
      <div className="debt-summary__not-found" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>No tienes acceso</h2>
        <p>No eres miembro de este grupo o no tienes permisos para ver sus deudas.</p>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--color-primary)' }}>← Volver</button>
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

      <div className="debt-summary__balance-card">
        <p className="debt-summary__balance-label">Gasto total del grupo</p>
        <p className="debt-summary__balance-amount">
          S/{groupTotalLocal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="debt-summary__group-name">{group?.emoji} {group?.name || 'Grupo'}</p>
        <span className="debt-summary__member-badge">
          {memberCount} miembro{memberCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="debt-summary__tabs">
        <button
          className={`debt-summary__tab ${statusTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setStatusTab('PENDING')}
        >
          ⏳ Pendientes
        </button>
        <button
          className={`debt-summary__tab ${statusTab === 'PAID' ? 'active' : ''}`}
          onClick={() => setStatusTab('PAID')}
        >
          ✅ Pagadas
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando deudas...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
      ) : (
        <div className="debt-summary__body">
          {statusTab === 'PENDING' && (
            <>
              {memberBalances.some(b => b.net !== 0) && (
                <div className="debt-summary__balances">
                  <p className="debt-summary__balances-label">Balance pendiente por persona</p>
                  <div className="debt-summary__balances-row">
                    {memberBalances.map(({ uid, net }) => {
                      const userDebt = debts.find(d => d.fromUserId === uid || d.toUserId === uid);
                      const userObj = userDebt ? (userDebt.fromUserId === uid ? userDebt.fromUser : userDebt.toUser) : null;
                      
                      return (
                        <div key={uid} className={`balance-pill ${net > 0 ? 'balance-pill--positive' : net < 0 ? 'balance-pill--negative' : ''}`}>
                          <div className="balance-pill__avatar" style={{ background: getAvatarColor(uid) }}>
                            {getInitial(userObj?.name)}
                          </div>
                          <div className="balance-pill__info">
                            <span className="balance-pill__name">{getName(userObj)}</span>
                            <span className="balance-pill__amount">
                              {net > 0 ? `Le deben S/${net.toFixed(2)}` : net < 0 ? `Debe S/${Math.abs(net).toFixed(2)}` : 'En paz ✓'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {debts.length === 0 ? (
                <div className="debt-summary__all-paid">
                  <span>🎉</span>
                  <p>¡No hay deudas pendientes!</p>
                </div>
              ) : (
                <div className="debt-summary__debts">
                  {debts.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                </div>
              )}
            </>
          )}

          {statusTab === 'PAID' && (
            <section className="debt-summary__section debt-summary__section--paid">
              {debts.length === 0 ? (
                <div className="debt-summary__all-paid">
                  <span>📋</span>
                  <p>Aún no hay deudas saldadas en este grupo.</p>
                </div>
              ) : (
                <div className="debt-summary__debts">
                  {debts.map(debt => <DebtCard key={debt.id} debt={debt} />)}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Modal para marcar como pagado manualmente (HU-F5.2) */}
      <MarkAsPaidModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmMarkPaid}
        isSubmitting={isSubmitting}
      />

      {/* Modal para pagar con créditos del sistema (HU-F5.3) */}
      <PayWithCreditsModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onConfirm={handleConfirmPayCredits}
        isSubmitting={isSubmittingCredit}
        debt={debtToPay}
        currentCredits={creditBalance}
      />
    </div>
  )
}

export default DebtSummary