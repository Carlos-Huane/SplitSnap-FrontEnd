import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getDebts, markDebtAsPaid, payDebtWithCredits } from '../../api/debtsService'
import MarkAsPaidModal from './MarkAsPaidModal'
import PayWithCreditsModal from './PayWithCreditsModal'
import './DebtSummary.css'

function DebtSummary() {
  const navigate = useNavigate()
  const { id: groupId } = useParams()
  
  const { groups, expenses, credits, currentUser, dispatch } = useApp()

  const group = groups.find(g => g.id === groupId)
  const groupExpenses = expenses.filter(e => e.groupId === groupId)
  const groupTotal = groupExpenses.reduce((sum, e) => sum + e.amount, 0)
  const memberCount = group?.memberIds.length || 0

  // --- ESTADOS LOCALES GENERALES ---
  const [debts, setDebts] = useState([])
  const [statusTab, setStatusTab] = useState('PENDING') 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState('')

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
        fromUserId: debt.fromUser.id,
        toUserId: debt.toUser.id,
        fromUser: debt.fromUser,
        toUser: debt.toUser
      }))
      
      setDebts(adaptedDebts)
    } catch (err) {
      if (err.message === '403') {
        setError('No tienes acceso a este grupo.')
      } else {
        setError(err.message || 'Ocurrió un error al cargar las deudas.')
      }
    } finally {
      setLoading(false)
    }
  }, [groupId, statusTab])

  useEffect(() => {
    if (groupId) fetchDebts()
  }, [fetchDebts])

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
      await markDebtAsPaid(groupId, selectedDebtId, paidWith)
      showToast('✓ Deuda marcada como pagada')
      setIsModalOpen(false)
      fetchDebts() 
    } catch (err) {
      if (err.message === '403') {
        alert('Solo el deudor puede marcar esta deuda como pagada.')
      } else if (err.message === '409') {
        alert('Esta deuda ya estaba pagada.')
        setIsModalOpen(false)
        fetchDebts() 
      } else {
        alert(err.message)
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
      await payDebtWithCredits(groupId, debtId)
      showToast('✓ Pago de deuda exitoso usando créditos')
      
      // Sincroniza el estado global de la app para descontar los créditos localmente
      dispatch({ type: 'SPEND_CREDITS', amount: debtToPay.amount })
      
      setIsCreditModalOpen(false)
      fetchDebts() 
    } catch (err) {
      if (err.message === '400_INSUFFICIENT_CREDITS') {
        alert('No tienes suficientes créditos. Serás redirigido a tu perfil para comprar.')
        navigate('/profile')
      } else if (err.message === '403') {
        alert('Solo el deudor puede pagar esta deuda.')
      } else if (err.message === '409') {
        alert('Esta deuda ya estaba pagada.')
        setIsCreditModalOpen(false)
        fetchDebts() 
      } else {
        alert(err.message)
      }
    } finally {
      setIsSubmittingCredit(false)
    }
  }

  // Visuales
  const getName = (userObj) => {
    if (!userObj) return 'Desconocido'
    return userObj.id === currentUser.id ? 'Tú' : userObj.name.split(' ')[0]
  }
  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'
  
  const getAvatarColor = (uid) => {
    const palette = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
    let hash = 0
    for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
  }

  const memberBalances = statusTab === 'PENDING' 
    ? (group?.memberIds || []).map(uid => {
        const owed = debts.filter(d => d.toUserId === uid).reduce((s, d) => s + d.amount, 0)
        const owes = debts.filter(d => d.fromUserId === uid).reduce((s, d) => s + d.amount, 0)
        return { uid, net: owed - owes }
      })
    : []

  // --- COMPONENTE DE TARJETA ---
  const DebtCard = ({ debt }) => {
    const isPaid = statusTab === 'PAID'
    const isDebtor = debt.fromUserId === currentUser.id

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
               <span className="debt-card__amount debt-card__amount--paid">S/{debt.amount.toFixed(2)}</span>
               <span className="debt-card__paid-label">✓ Pagado</span>
             </div>
          ) : (
            <span className="debt-card__amount">S/{debt.amount.toFixed(2)}</span>
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
                  💰 Pagar con créditos · S/{debt.amount.toFixed(2)}
                </button>
              )}
            </div>
            
            {isDebtor ? (
              <>
                <p className="debt-card__credits-hint">
                  Saldo: {credits.toFixed(2)} créditos
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
          S/{groupTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
        currentCredits={credits}
      />
    </div>
  )
}

export default DebtSummary