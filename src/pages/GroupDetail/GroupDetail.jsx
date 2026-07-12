import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getGroup } from '../../services/groups.service'
import { getExpensesByGroup } from '../../services/expenses.service'
import { getDebts } from '../../services/debts.service'
import { extractErrorMessage, resolveAssetUrl } from '../../services/api'
import './GroupDetail.css'

const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function GroupDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentUser } = useApp()

  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      getGroup(id),
      getExpensesByGroup(id).catch(() => []),
      getDebts(id, 'PENDING').catch(() => []),
    ])
      .then(([g, exps, ds]) => {
        if (cancelled) return
        setGroup(g)
        setExpenses(exps || [])
        setDebts(ds || [])
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 403) {
          setError('No tienes acceso a este grupo.')
        } else if (err.response?.status === 404) {
          setError('Grupo no encontrado.')
        } else {
          setError(extractErrorMessage(err, 'No pudimos cargar el grupo.'))
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="group-detail">
        <div className="group-detail__header">
          <button className="group-detail__back" onClick={() => navigate('/groups')}>←</button>
          <h1 className="group-detail__title">Cargando grupo...</h1>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="group-detail__not-found">
        {error || 'Grupo no encontrado.'}{' '}
        <button onClick={() => navigate('/groups')} style={{ color: 'var(--color-primary)' }}>
          Volver a grupos
        </button>
      </div>
    )
  }

  // El backend devuelve members[] como array de objetos {id, name, email, avatarUrl, ...}
  const members = (group.members || []).map(m => m.user || m).filter(Boolean)

  const getUserBalance = (userId) => {
    let balance = 0
    debts.forEach(d => {
      const status = (d.status || '').toLowerCase()
      if (status !== 'pending') return
      const fromId = d.fromUser?.id ?? d.fromUserId
      const toId = d.toUser?.id ?? d.toUserId
      if (toId === userId) balance += d.amount
      if (fromId === userId) balance -= d.amount
    })
    return balance
  }

  const recentExpenses = expenses.slice(0, 5)
  const pendingCount = debts.filter(d => (d.status || '').toLowerCase() === 'pending').length

  return (
    <div className="group-detail">
      <div className="group-detail__header">
        <button className="group-detail__back" onClick={() => navigate('/groups')}>←</button>
        <h1 className="group-detail__title">
          <span>{group.emoji || '📦'}</span> {group.name}
        </h1>
        <p className="group-detail__members-count">
          {members.length} miembro{members.length !== 1 ? 's' : ''}
        </p>
        <button
          className="group-detail__invite"
          onClick={() => navigate(`/groups/${id}/invite`)}
          aria-label="Invitar miembros"
        >
          👤+
        </button>
      </div>

      <div className="group-detail__content">
        <section className="group-detail__section">
          <h2 className="group-detail__section-title">Balance del grupo</h2>
          <div className="group-detail__balances">
            {members.map((member, idx) => {
              const balance = getUserBalance(member.id)
              return (
                <div key={member.id} className="balance-row">
                  <div className="balance-row__user">
                    <div
                      className="balance-row__avatar"
                      style={{
                        background: member.avatarUrl ? 'transparent' : avatarColors[idx % avatarColors.length],
                        overflow: 'hidden'
                      }}
                    >
                      {member.avatarUrl ? (
                        <img
                          src={resolveAssetUrl(member.avatarUrl)}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        getInitial(member.name)
                      )}
                    </div>
                    <div className="balance-row__name-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="balance-row__name" style={{ fontWeight: 500 }}>
                        {member.id === currentUser?.id ? 'Tú' : (member.name || 'Usuario')}
                      </span>
                      {member.id !== currentUser?.id && member.email && (
                        <span className="balance-row__email" style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`balance-row__amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                    {balance >= 0 ? '+' : '-'}S/ {Math.abs(balance).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="group-detail__section">
          <h2 className="group-detail__section-title">Gastos recientes</h2>
          <div className="group-detail__expenses">
            {recentExpenses.length === 0 ? (
              <p className="group-detail__empty-expenses">Aún no hay gastos en este grupo</p>
            ) : (
              recentExpenses.map(expense => {
                const paidByUser = members.find(u => u.id === expense.paidBy)
                const rawDate = expense.expenseDate || expense.date
                const expenseDate = rawDate
                  ? new Date(rawDate + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
                  : 'Hoy'
                return (
                  <div key={expense.id} className="expense-row">
                    <div className="expense-row__info">
                      <p className="expense-row__desc">{expense.description}</p>
                      <p className="expense-row__meta">
                        {paidByUser
                          ? (paidByUser.id === currentUser?.id ? 'Tú' : paidByUser.name)
                          : 'Alguien'} · {expenseDate}
                      </p>
                    </div>
                    <span className="expense-row__amount">S/ {Number(expense.amount).toFixed(2)}</span>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      <div className="group-detail__debts-banner">
        <div className="group-detail__debts-info">
          <span className="group-detail__debts-icon">💰</span>
          <span className="group-detail__debts-text">
            {pendingCount} deuda{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          className="group-detail__debts-btn"
          onClick={() => navigate(`/groups/${id}/debts`)}
        >
          Ver resumen →
        </button>
      </div>

      <div className="group-detail__actions">
        <button
          className="group-detail__btn group-detail__btn--secondary"
          onClick={() => navigate(`/groups/${id}/scan`)}
        >
          📷 Escanear recibo
        </button>
        <button
          className="group-detail__btn group-detail__btn--primary"
          onClick={() => navigate(`/groups/${id}/add-expense`)}
        >
          + Agregar gasto
        </button>
      </div>
    </div>
  )
}

export default GroupDetail
