import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// 1. Importamos el array de usuarios desde tu archivo de datos
import { users } from '../data/global' 
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Estado para mostrar un mensaje si el login falla
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('') // Limpiar errores previos

    // 2. Buscamos si existe un usuario con ese email y contraseña
    const userFound = users.find(
      (user) => user.email === email && user.password === password
    )

    if (userFound) {
      // Si existe, guardamos (opcionalmente) algo en localStorage y navegamos
      console.log('Bienvenido:', userFound.name)
      // localStorage.setItem('user', JSON.stringify(userFound)) // Útil para mantener la sesión
      navigate('/dashboard')
    } else {
      // 3. Si no existe, mostramos un error
      setError('Credenciales incorrectas. Intenta de nuevo.')
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

          {/* Mostrar error si los datos son incorrectos */}
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