import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

function RequireAuth({ children }) {
  const { currentUser } = useApp()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default RequireAuth
