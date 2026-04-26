import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import './GroupList.css'

function GroupList() {
  const navigate = useNavigate()
  const { groups, expenses } = useApp()

  const getGroupTotal = (groupId) =>
    expenses
      .filter(e => e.groupId === groupId)
      .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="group-list">
      <div className="group-list__header">
        <h1 className="group-list__title">Mis grupos</h1>
        <button
          className="group-list__new-btn"
          onClick={() => navigate('/groups/new')}
        >
          + Nuevo grupo
        </button>
      </div>

      {groups.length === 0 ? (
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
              const total = getGroupTotal(group.id)
              const memberCount = group.memberIds.length
              return (
                <div
                  key={group.id}
                  className="group-card"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <div className="group-card__icon">{group.emoji}</div>
                  <div className="group-card__info">
                    <h3 className="group-card__name">{group.name}</h3>
                    <p className="group-card__members">{memberCount} miembro{memberCount !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="group-card__total">
                    S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 0 })}
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
