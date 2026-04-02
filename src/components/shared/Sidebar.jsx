import { useNavigate, useLocation } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { label: 'Inicio', icon: '🏠', path: '/dashboard' },
  { label: 'Mis grupos', icon: '👥', path: '/groups/1' },
  { label: 'Historial', icon: '🕐', path: '/historial' },
  { label: 'Perfil', icon: '👤', path: '/profile' },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

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
            className={`sidebar__nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="sidebar__new-group" onClick={() => navigate('/groups/new')}>
        <span>+</span>
        <span>Nuevo grupo</span>
      </button>
    </aside>
  )
}

export default Sidebar
