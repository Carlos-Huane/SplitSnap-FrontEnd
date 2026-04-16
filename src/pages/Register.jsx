import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { authMessages } from '../data/auth' 
import './Login.css'
import './Register.css'

function Register() {
  const navigate = useNavigate()

  // 1. Datos
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    // 2. Validación
    if (!name || !email || !password) {
      setError(authMessages.requiredField)
      return
    }

    if (password.length < 6) {
      setError(authMessages.passwordTooShort)
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Si todo está bien
    alert(authMessages.registerSuccess)
    navigate('/login')
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
          <h2 className="login__form-title">Regístrate y forma parte</h2>
          <p className="login__form-subtitle">Ingresa tus datos para continuar</p>

          {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}

          <div className="login__fields">
            <div className="login__field">
              <label className="login__label">Nombre completo</label>
              <input
                className="login__input"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <label className="login__label">Número telefónico</label>
              <input
                className="login__input"
                type="tel"
                placeholder="+51 999 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="login__field">
              <label className="login__label">Contraseña</label>
              <input
                className="login__input"
                type="password"
                placeholder="Mínimo 6 dígitos"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login__field">
              <label className="login__label">Confirmar contraseña</label>
              <input
                className="login__input"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button className="login__btn" type="submit">
            Crear cuenta
          </button>
          
          <p className="login__link">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')}>Iniciar sesión</span>
          </p>

        </form>
      </div>
    </div>
  )
}

export default Register