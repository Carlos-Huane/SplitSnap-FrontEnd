import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { label: 'Inicio', icon: '🏠', path: '/dashboard', match: '/dashboard' },
  { label: 'Mis grupos', icon: '👥', path: '/groups', match: '/groups' },
  { label: 'Historial', icon: '🕐', path: '/historial', match: '/historial' },
  { label: 'Perfil', icon: '👤', path: '/profile', match: '/profile' },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (match) => location.pathname === match || location.pathname.startsWith(match + '/')

  return (
    <aside className="sidebar">
      <div className="sidebar__logo" onClick={() => navigate('/dashboard')}>
        <div className="sidebar__logo-icon">S</div>
        <span className="sidebar__logo-text">SplitSnap</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(item => (
          <button
            key={item.label}
            className={`sidebar__nav-item ${isActive(item.match) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="sidebar__logout" onClick={() => navigate('/login')}>
        <span className="sidebar__logout-icon">🚪</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  )
}

export default Sidebar
