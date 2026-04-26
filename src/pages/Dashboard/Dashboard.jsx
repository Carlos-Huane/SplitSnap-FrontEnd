import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import '../../styles/dashboard.css'

const getInitials = (fullName) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')

const formatRelative = (isoDate) => {
  const today = new Date()
  const date = new Date(isoDate + 'T00:00:00')
  const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 7) return `Hace ${diff} días`
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

function Dashboard() {
  const navigate = useNavigate()
  const { groups, expenses, debts, profileAvatar, currentUser } = useApp()

  const pendingTotal = useMemo(() => {
    return debts
      .filter(d => d.status !== 'paid')
      .reduce((sum, d) => sum + d.amount, 0)
  }, [debts])

  const recentActivity = useMemo(() => {
    return expenses
      .map(e => {
        const group = groups.find(g => g.id === e.groupId)
        return {
          id: e.id,
          icon: group?.emoji || '💸',
          title: e.description,
          info: `${group?.name || 'Grupo'} · ${formatRelative(e.date)}`,
          amount: e.amount,
          groupId: e.groupId,
          date: e.date,
        }
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [expenses, groups])

  if (!currentUser) return null
  const firstName = currentUser.name.split(' ')[0]

  const balanceLabel = pendingTotal > 0
    ? 'Total por saldar en tus grupos'
    : 'Estás al día, no hay deudas pendientes'

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h2>Hola, {firstName} 👋</h2>
          <p>Bienvenido de vuelta</p>
        </div>

        <div className="user-info" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <span className="user-name">{currentUser.name}</span>
          <div className="avatar">
            {profileAvatar
              ? <img src={profileAvatar} alt={currentUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : getInitials(currentUser.name)}
          </div>
        </div>
      </div>

      <div className="balance-card">
        <p className="balance-label">Por saldar</p>
        <h1 className="balance-amount">
          S/ {pendingTotal.toFixed(2)}
        </h1>
        <span className="balance-sub">{balanceLabel}</span>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Actividad reciente</h3>
          {recentActivity.length > 0 && (
            <span className="link" onClick={() => navigate('/historial')}>Ver todo</span>
          )}
        </div>

        {recentActivity.length === 0 ? (
          <div className="dashboard-empty">
            <span className="dashboard-empty__icon">📭</span>
            <p className="dashboard-empty__title">Aún no hay actividad</p>
            <p className="dashboard-empty__desc">
              Crea un grupo y registra tu primer gasto para verlo aquí.
            </p>
            <button className="btn primary" onClick={() => navigate('/groups')}>
              Ir a Mis grupos
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div
                className="activity-item"
                key={item.id}
                onClick={() => navigate(`/groups/${item.groupId}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="icon">{item.icon}</div>
                <div className="info">
                  <p>{item.title}</p>
                  <span>{item.info}</span>
                </div>
                <div className="amount">
                  S/ {item.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Mis grupos</h3>
          {groups.length > 0 && (
            <span className="link" onClick={() => navigate('/groups')}>Ver todos</span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="dashboard-empty">
            <span className="dashboard-empty__icon">👥</span>
            <p className="dashboard-empty__title">No tienes grupos todavía</p>
            <p className="dashboard-empty__desc">
              Crea tu primer grupo para empezar a dividir gastos.
            </p>
            <button className="btn primary" onClick={() => navigate('/groups/new')}>
              + Crear grupo
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {groups.slice(0, 4).map(g => {
              const total = expenses
                .filter(e => e.groupId === g.id)
                .reduce((sum, e) => sum + e.amount, 0)
              const memberCount = g.memberIds.length
              return (
                <div
                  key={g.id}
                  className="activity-item"
                  onClick={() => navigate(`/groups/${g.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="icon">{g.emoji}</div>
                  <div className="info">
                    <p>{g.name}</p>
                    <span>{memberCount} miembro{memberCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="amount">S/ {total.toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
