import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getMyGroups } from '../../services/groups.service'
import { getDebts } from '../../services/debts.service'
import { getMe } from '../../services/users.service'
import { extractErrorMessage, resolveAssetUrl } from '../../services/api'
import '../../styles/dashboard.css'

const getInitials = (fullName = '') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('')

function Dashboard() {
  const navigate = useNavigate()
  const { profileAvatar, currentUser } = useApp()

  const [groups, setGroups] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getMyGroups(), getMe().catch(() => null)])
      .then(async ([gs, me]) => {
        if (cancelled) return

        // Fetch debts for each group to compute myBalance dynamically
        const myId = me?.id || currentUser?.id
        const groupsWithBalance = await Promise.all((gs || []).map(async (g) => {
          try {
            const debtsList = await getDebts(g.id, 'PENDING')
            let balance = 0
            debtsList.forEach(d => {
              const status = (d.status || '').toLowerCase()
              if (status !== 'pending') return
              const fromId = d.fromUser?.id ?? d.fromUserId
              const toId = d.toUser?.id ?? d.toUserId
              if (toId === myId) balance += d.amount
              if (fromId === myId) balance -= d.amount
            })
            return { ...g, myBalance: balance }
          } catch {
            return { ...g, myBalance: 0 }
          }
        }))

        if (cancelled) return
        setGroups(groupsWithBalance)
        if (me) setProfile(me)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractErrorMessage(err, 'No pudimos cargar tu dashboard.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [currentUser?.id])

  const userName = profile?.name || currentUser?.name || ''
  const firstName = userName.split(' ')[0] || 'Usuario'
  const avatarSrc = resolveAssetUrl(profile?.avatarUrl || profileAvatar)

  const netBalance = useMemo(() => {
    return groups.reduce((sum, g) => sum + (Number(g.myBalance) || 0), 0)
  }, [groups])

  const balanceLabel = netBalance > 0
    ? 'Te deben en total'
    : netBalance < 0
      ? 'Debes en total'
      : 'Estás al día'

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h2>Hola, {firstName} 👋</h2>
          <p>Bienvenido de vuelta</p>
        </div>

        <div className="user-info" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <span className="user-name">{userName}</span>
          <div className="avatar">
            {avatarSrc
              ? <img src={avatarSrc} alt={userName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : getInitials(userName)}
          </div>
        </div>
      </div>

      <div className={`balance-card ${netBalance > 0 ? 'positive-card' : netBalance < 0 ? 'negative-card' : ''}`}>
        <p className="balance-label">
          {netBalance > 0 ? 'Te deben' : netBalance < 0 ? 'Por saldar (Debes)' : 'Por saldar'}
        </p>
        <h1 className="balance-amount">
          S/ {Math.abs(netBalance).toFixed(2)}
        </h1>
        <span className="balance-sub">{balanceLabel}</span>
      </div>

      {error && (
        <p style={{ color: '#ff4d4d', padding: '0 1rem' }}>⚠️ {error}</p>
      )}

      <div className="section">
        <div className="section-header">
          <h3>Mis grupos</h3>
          {groups.length > 0 && (
            <span className="link" onClick={() => navigate('/groups')}>Ver todos</span>
          )}
        </div>

        {loading ? (
          <p style={{ padding: '1rem' }}>Cargando...</p>
        ) : groups.length === 0 ? (
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
              const memberCount = g.memberCount ?? g.members?.length ?? 0
              return (
                <div
                  key={g.id}
                  className="activity-item"
                  onClick={() => navigate(`/groups/${g.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="icon">{g.emoji || '📦'}</div>
                  <div className="info">
                    <p>{g.name}</p>
                    <span>{memberCount} miembro{memberCount !== 1 ? 's' : ''}</span>
                  </div>
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
