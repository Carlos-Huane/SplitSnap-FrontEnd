import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import './DebtSummary.css'
import { getDebts } from '../../api/debtsService';

function DebtSummary() {
  const navigate = useNavigate()
  const { id: groupId } = useParams()
  
  // Extraemos lo necesario del context (ya no sacamos "debts" ni "allUsers" de aquí)
  const { groups, expenses, credits, currentUser, dispatch } = useApp()

  const group = groups.find(g => g.id === groupId)
  const groupExpenses = expenses.filter(e => e.groupId === groupId)
  const groupTotal = groupExpenses.reduce((sum, e) => sum + e.amount, 0)
  const memberCount = group?.memberIds.length || 0

  // --- ESTADOS LOCALES PARA LA API ---
  const [debts, setDebts] = useState([])
  const [statusTab, setStatusTab] = useState('PENDING') // 'PENDING' o 'PAID'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState('')

  // --- EFECTO: LLAMADA A LA API ---
  useEffect(() => {
    const fetchDebts = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getDebts(groupId, statusTab)
        
        // ADAPTER: El backend envía { fromUser: { id, name... } }
        // El front necesita fromUserId (flat)
        const adaptedDebts = data.map(debt => ({
          ...debt,
          fromUserId: debt.fromUser.id,
          toUserId: debt.toUser.id,
          // Mantenemos el objeto original por si necesitamos el nombre/avatar
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
    }

    if (groupId) fetchDebts()
  }, [groupId, statusTab]) // Se vuelve a llamar si cambia el ID o la pestaña

  // --- FUNCIONES AUXILIARES ---
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // (Placeholders para tus siguientes HUs)
  const markAsPaid = (debtId) => dispatch({ type: 'MARK_DEBT_PAID', debtId })
  const payWithCredits = (debt) => {
    if (credits < debt.amount) {
      showToast(`Créditos insuficientes. Te faltan S/ ${(debt.amount - credits).toFixed(2)}.`)
      return
    }
    // Lógica futura...
  }

  // Funciones visuales usando los datos que vienen dentro de fromUser/toUser
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

  // --- CÁLCULO DE BALANCES (Solo para la pestaña PENDIENTES) ---
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
              <button
                className="debt-card__pay-btn debt-card__pay-btn--credits"
                onClick={() => payWithCredits(debt)}
                disabled={credits < debt.amount}
              >
                💰 Pagar con créditos · S/{debt.amount.toFixed(2)}
              </button>
            </div>
            <p className="debt-card__credits-hint">
              Saldo: {credits.toFixed(2)} créditos
            </p>
            <button className="debt-card__mark-paid" onClick={() => markAsPaid(debt.id)}>
              ☑ Marcar como pagado (manual)
            </button>
          </>
        )}
      </div>
    )
  }

  // --- RENDERIZADO DE ERROR 403 ---
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

      {/* TABS REQUERIDOS POR HU-F5.1 */}
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

      {/* CONTENIDO */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando deudas...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
      ) : (
        <div className="debt-summary__body">
          
          {/* TAB: PENDIENTES */}
          {statusTab === 'PENDING' && (
            <>
              {memberBalances.some(b => b.net !== 0) && (
                <div className="debt-summary__balances">
                  <p className="debt-summary__balances-label">Balance pendiente por persona</p>
                  <div className="debt-summary__balances-row">
                    {memberBalances.map(({ uid, net }) => {
                      // Buscar el usuario para renderizar su avatar
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

          {/* TAB: PAGADAS */}
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
    </div>
  )
}

export default DebtSummary