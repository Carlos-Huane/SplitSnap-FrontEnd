import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { getMyGroups } from '../../services/groups.service'
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
      .then(([gs, me]) => {
        if (cancelled) return
        setGroups(gs || [])
        if (me) setProfile(me)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractErrorMessage(err, 'No pudimos cargar tu dashboard.'))
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const userName = profile?.name || currentUser?.name || ''
  const firstName = userName.split(' ')[0] || 'Usuario'
  const avatarSrc = resolveAssetUrl(profile?.avatarUrl || profileAvatar)

  // myBalance/recentActivity son gaps conocidos del backend (no vienen en /api/groups)
  // Mostramos placeholders hasta que el backend los agregue.
  const pendingTotal = useMemo(() => {
    return groups.reduce((sum, g) => sum + (Number(g.myBalance) || 0), 0)
  }, [groups])

  const balanceLabel = pendingTotal > 0
    ? 'Total por saldar en tus grupos'
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

      <div className="balance-card">
        <p className="balance-label">Por saldar</p>
        <h1 className="balance-amount">
          S/ {pendingTotal.toFixed(2)}
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
