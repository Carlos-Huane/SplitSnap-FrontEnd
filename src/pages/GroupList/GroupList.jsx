import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyGroups } from '../../services/groups.service'
import { getDebts } from '../../services/debts.service'
import { useApp } from '../../context/AppContext'
import { extractErrorMessage } from '../../services/api'
import './GroupList.css'

function GroupList() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMyGroups()
      .then((data) => {
        if (cancelled) return
        const sorted = [...data].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '', 'es')
        ).map(g => ({ ...g, myBalance: undefined }))

        setGroups(sorted)
        setError(null)
        setLoading(false)

        // Fetch balances asynchronously in background
        const myId = currentUser?.id
        sorted.forEach(async (group) => {
          try {
            const debtsList = await getDebts(group.id, 'PENDING')
            let balance = 0
            debtsList.forEach(d => {
              const status = (d.status || '').toLowerCase()
              if (status !== 'pending') return
              const fromId = d.fromUser?.id ?? d.fromUserId
              const toId = d.toUser?.id ?? d.toUserId
              if (toId === myId) balance += d.amount
              if (fromId === myId) balance -= d.amount
            })
            if (!cancelled) {
              setGroups(prev => prev.map(g => g.id === group.id ? { ...g, myBalance: balance } : g))
            }
          } catch {
            if (!cancelled) {
              setGroups(prev => prev.map(g => g.id === group.id ? { ...g, myBalance: 0 } : g))
            }
          }
        })
      })
      .catch((err) => {
        if (cancelled) return
        setError(extractErrorMessage(err, 'No pudimos cargar tus grupos.'))
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [currentUser?.id])

  const getMemberCount = (g) =>
    g.memberCount ?? g.members?.length ?? g.memberIds?.length ?? 0

  return (
    <div className="group-list">
      <div className="group-list__header">
        <h1 className="group-list__title">Mis grupos</h1>
        <p className="group-list__subtitle">
          {loading ? 'Cargando...' : `${groups.length} grupo${groups.length !== 1 ? 's' : ''}`}
        </p>
        <button
          className="group-list__new-btn"
          onClick={() => navigate('/groups/new')}
        >
          + Nuevo grupo
        </button>
      </div>

      {error && (
        <p className="group-list__error" style={{ color: '#ff4d4d', padding: '1rem' }}>
          ⚠️ {error}
        </p>
      )}

      {loading ? (
        <div className="group-list__grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="group-card" style={{ pointerEvents: 'none', opacity: 0.7 }}>
              <div className="group-card__icon skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
              <div className="group-card__info" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="skeleton" style={{ width: '140px', height: '18px' }} />
                <div className="skeleton" style={{ width: '80px', height: '12px' }} />
              </div>
              <div className="skeleton" style={{ width: '70px', height: '20px', marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="group-list__empty">
          <div className="group-list__empty-icon">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="36" r="34" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4" fill="#FFF7ED" />
              <circle cx="26" cy="32" r="7" stroke="#F97316" strokeWidth="2" fill="none" />
              <circle cx="46" cy="32" r="7" stroke="#F97316" strokeWidth="2" fill="none" />
              <path d="M24 47 C24 42 48 42 48 47" stroke="#F97316" strokeWidth="2" fill="none" />
              <circle cx="52" cy="52" r="9" fill="#F97316" />
              <path d="M49 52h6M52 49v6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="group-list__empty-title">Aún no tienes grupos</h2>
          <p className="group-list__empty-desc">
            Crea tu primer grupo y empieza a dividir gastos fácilmente
          </p>
          <button
            className="group-list__empty-cta"
            onClick={() => navigate('/groups/new')}
          >
            + Crear mi primer grupo
          </button>
          <p className="group-list__empty-hint">
            📷 Escanea recibos para dividir automáticamente
          </p>
        </div>
      ) : (
        <>
          <div className="group-list__grid">
            {groups.map(group => {
              const memberCount = getMemberCount(group)
              return (
                <div
                  key={group.id}
                  className="group-card"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="group-card__icon">{group.emoji || '📦'}</div>
                  <div className="group-card__info">
                    <h3
                      className="group-card__name"
                      title={group.name}
                    >
                      {group.name}
                    </h3>
                    <p className="group-card__members">{memberCount} miembro{memberCount !== 1 ? 's' : ''}</p>
                  </div>
                  <span
                    className="group-card__total"
                    style={{
                      color:
                        group.myBalance > 0
                          ? 'var(--color-success)'
                          : group.myBalance < 0
                          ? 'var(--color-danger)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {typeof group.myBalance === 'number'
                      ? (group.myBalance > 0
                          ? `+S/ ${group.myBalance.toFixed(2)}`
                          : group.myBalance < 0
                          ? `-S/ ${Math.abs(group.myBalance).toFixed(2)}`
                          : 'S/ 0.00')
                      : <span className="skeleton" style={{ width: '60px', height: '16px' }} />}
                  </span>
                </div>
              )
            })}
          </div>

          <button
            className="group-list__fab"
            onClick={() => navigate('/groups/new')}
            aria-label="Crear grupo"
          >
            +
          </button>
        </>
      )}
    </div>
  )
}

export default GroupList
