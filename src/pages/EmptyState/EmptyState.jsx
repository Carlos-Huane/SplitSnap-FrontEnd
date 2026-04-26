import { useNavigate } from 'react-router-dom'
import './EmptyState.css'

function EmptyState() {
  const navigate = useNavigate()

  return (
    <div className="empty-state">
      <button className="empty-state__back" onClick={() => navigate('/dashboard')}>
        ← Mis grupos
      </button>

      <div className="empty-state__content">
        <div className="empty-state__icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4" fill="#FFF7ED" />
            <circle cx="30" cy="36" r="8" stroke="#F97316" strokeWidth="2" fill="none" />
            <circle cx="50" cy="36" r="8" stroke="#F97316" strokeWidth="2" fill="none" />
            <path d="M28 52 C28 46 52 46 52 52" stroke="#F97316" strokeWidth="2" fill="none" />
            <circle cx="56" cy="56" r="10" fill="#F97316" />
            <path d="M52 56h8M56 52v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="empty-state__title">Aún no tienes grupos</h2>
        <p className="empty-state__desc">
          Crea tu primer grupo y empieza a dividir gastos fácilmente
        </p>

        <button
          className="empty-state__cta"
          onClick={() => navigate('/groups/new')}
        >
          + Crear mi primer grupo
        </button>

        <p className="empty-state__hint">
          📷 Escanea recibos para dividir automáticamente
        </p>
      </div>
    </div>
  )
}

export default EmptyState
