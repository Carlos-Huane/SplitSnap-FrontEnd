import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getExpensesByGroup } from '../../services/expenses.service' 
import './GroupDetail.css'

function GroupDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  

  const { groups, debts, allUsers, currentUser } = useApp()
  const users = allUsers


  const [serverExpenses, setServerExpenses] = useState([])
  const [loadingExpenses, setLoadingExpenses] = useState(true)
  const [errorExpenses, setErrorExpenses] = useState(null)

  // 1. Efecto para cargar los gastos reales desde el Backend
  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoadingExpenses(true)
        setErrorExpenses(null)
        const data = await getExpensesByGroup(id)
        setServerExpenses(data) // El backend ya los devuelve ordenados por fecha desc
      } catch (err) {
        console.error("Error cargando gastos:", err)
        setErrorExpenses("No se pudieron cargar los gastos del servidor.")
      } finally {
        setLoadingExpenses(false)
      }
    }

    if (id) {
      fetchExpenses()
    }
  }, [id])

  const group = groups.find(g => g.id === id)
  if (!group) {
    return (
      <div className="group-detail__not-found">
        Grupo no encontrado.{' '}
        <button onClick={() => navigate('/groups')} style={{ color: 'var(--color-primary)' }}>
          Volver a grupos
        </button>
      </div>
    )
  }

  // Las deudas siguen viniendo del contexto 
  const groupDebts = debts.filter(d => d.groupId === id)
  const members = group.memberIds.map(uid => users.find(u => u.id === uid)).filter(Boolean)

  const getUserBalance = (userId) => {
    let balance = 0
    groupDebts.forEach(d => {
      // Validamos tanto en minúsculas como en mayúsculas por si el backend usa el Enum "PENDING"
      if (d.status?.toLowerCase() !== 'pending') return
      if (d.toUserId === userId) balance += d.amount
      if (d.fromUserId === userId) balance -= d.amount
    })
    return balance
  }

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'
  const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']

  // Tomamos los 5 más recientes directamente de los datos del servidor
  const recentExpenses = serverExpenses.slice(0, 5)

  return (
    <div className="group-detail">
      <div className="group-detail__header">
        <button className="group-detail__back" onClick={() => navigate('/groups')}>←</button>
        <h1 className="group-detail__title">
          <span>{group.emoji}</span> {group.name}
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
        {/* Balance del grupo */}
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
                      style={{ background: avatarColors[idx % avatarColors.length] }}
                    >
                      {getInitial(member.name)}
                    </div>
                    <span className="balance-row__name">
                      {member.id === currentUser.id ? 'Tú' : member.name.split(' ')[0]}
                    </span>
                  </div>
                  <span className={`balance-row__amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                    {balance >= 0 ? '+' : '-'}S/ {Math.abs(balance).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Gastos recientes — Conectado a Épica F3 Real */}
        <section className="group-detail__section">
          <h2 className="group-detail__section-title">Gastos recientes</h2>
          <div className="group-detail__expenses">
            {loadingExpenses ? (
              <p className="group-detail__empty-expenses">Cargando historial de gastos...</p>
            ) : errorExpenses ? (
              <p className="group-detail__error-text">⚠️ {errorExpenses}</p>
            ) : recentExpenses.length === 0 ? (
              <p className="group-detail__empty-expenses">Aún no hay gastos en este grupo</p>
            ) : (
              recentExpenses.map(expense => {
                const paidByUser = users.find(u => u.id === expense.paidBy)
                
                // Mapeo seguro de la fecha: maneja tanto expense.date como expense.expenseDate de Swagger
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
                          ? (paidByUser.id === currentUser.id ? 'Tú' : paidByUser.name.split(' ')[0])
                          : 'Alguien'} · {expenseDate}
                      </p>
                    </div>
                    <span className="expense-row__amount">S/ {expense.amount.toFixed(2)}</span>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* Resumen de deudas */}
      <div className="group-detail__debts-banner">
        <div className="group-detail__debts-info">
          <span className="group-detail__debts-icon">💰</span>
          <span className="group-detail__debts-text">
            {groupDebts.filter(d => d.status?.toLowerCase() === 'pending').length} deudas pendientes
          </span>
        </div>
        <button
          className="group-detail__debts-btn"
          onClick={() => navigate(`/groups/${id}/debts`)}
        >
          Ver resumen →
        </button>
      </div>

      {/* Acciones */}
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