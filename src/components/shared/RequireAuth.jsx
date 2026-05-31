import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { isAuthenticated, getToken } from '../../services/auth.service'

function RequireAuth({ children }) {
  const { currentUser } = useApp()
  const location = useLocation()

  // Acepta dos modos durante la migracion al backend real:
  //  - Si hay JWT valido en localStorage -> autenticado.
  //  - Si no hay JWT pero hay currentUser (sesion mock antigua) -> tambien autenticado.
  // Esto permite que las pantallas que aun usan mock sigan funcionando hasta
  // que cada epica migre al login real.
  const authed = isAuthenticated() || (!getToken() && Boolean(currentUser))

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default RequireAuth
