import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { login as loginAPI, saveToken, getToken } from '../../api/authService'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch } = useApp()

  // Si hay token válido, redirigir a dashboard (persistencia de sesión)
  useEffect(() => {
    if (getToken()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Llamar al backend
      const response = await loginAPI({
        email: email.trim().toLowerCase(),
        password,
      })

      // Guardar token y actualizar contexto
      saveToken(response.token)
      dispatch({ type: 'LOGIN', userId: response.user.id })

      // Navegar al dashboard
      const redirect = location.state?.from || '/dashboard'
      navigate(redirect, { replace: true })
    } catch (err) {
      // Manejar errores del backend
      if (err.message.includes('401')) {
        setError('Credenciales incorrectas.')
      } else if (err.message.includes('400')) {
        setError('Datos inválidos.')
      } else {
        setError(err.message || 'Error en login. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login__brand">
        <div className="login__brand-content">
          <div className="login__logo">S</div>
          <h1 className="login__brand-name">SplitSnap</h1>
          <p className="login__brand-tagline">
            Divide cuentas en segundos con solo una foto
          </p>
        </div>
      </div>

      <div className="login__form-side">
        <form className="login__form" onSubmit={handleSubmit}>
          <h2 className="login__form-title">Iniciar sesión</h2>
          <p className="login__form-subtitle">Ingresa tus datos para continuar</p>

          {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <div className="login__fields">
            <div className="login__field">
              <label className="login__label">Correo electrónico</label>
              <input
                className="login__input"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="login__field">
              <label className="login__label">Contraseña</label>
              <input
                className="login__input"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login__forgot-link"
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button className="login__btn" type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <p className="login__link">
            ¿No tienes cuenta?{' '}
            <span onClick={() => navigate('/register')}>Regístrate</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
