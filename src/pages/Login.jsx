import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/dashboard')
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

          <div className="login__fields">
            <div className="login__field">
              <label className="login__label">Correo electrónico</label>
              <input
                className="login__input"
                type="email"
                placeholder="tu@email.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="login__btn" type="submit">
            Iniciar sesión
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
