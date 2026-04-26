import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, genId } from '../../context/AppContext'
import '../Login/Login.css'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const { allUsers, dispatch } = useApp()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setError('')

    const name = formData.name.trim().replace(/\s+/g, ' ')
    const email = formData.email.trim().toLowerCase()
    const phone = formData.phone.trim().replace(/\s+/g, '')

    if (name.length < 3) {
      setError('Ingresa tu nombre completo (mínimo 3 caracteres).')
      return
    }
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s[A-Za-zÁÉÍÓÚÑáéíóúñ]+)+$/.test(name)) {
      setError('El nombre debe contener nombre y apellido, solo letras.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (!/^\+?\d{7,15}$/.test(phone)) {
      setError('El teléfono debe tener entre 7 y 15 dígitos (puede iniciar con +).')
      return
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const exists = allUsers.some((u) => u.email.toLowerCase() === email)
    if (exists) {
      setError('Este correo ya está registrado.')
      return
    }

    const newUser = {
      id: genId('u'),
      name,
      email,
      phone,
      password: formData.password,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      currency: 'PEN',
      createdAt: new Date().toISOString().split('T')[0],
    }

    dispatch({ type: 'REGISTER_USER', user: newUser })
    navigate('/dashboard', { replace: true })
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
        <form className="login__form" onSubmit={handleRegister}>
          <h2 className="login__form-title">Crear cuenta</h2>
          <p className="login__form-subtitle">Únete a SplitSnap hoy mismo</p>

          {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <div className="login__fields">
            <div className="login__field">
              <label className="login__label">Nombre completo</label>
              <input
                className="login__input"
                name="name"
                type="text"
                placeholder="Ej. Juan Pérez"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="login__field">
              <label className="login__label">Correo electrónico</label>
              <input
                className="login__input"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="login__field">
              <label className="login__label">Número de teléfono</label>
              <input
                className="login__input"
                name="phone"
                type="tel"
                placeholder="+51 999 999 999"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="login__field">
              <label className="login__label">Contraseña</label>
              <input
                className="login__input"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="login__field">
              <label className="login__label">Confirmar contraseña</label>
              <input
                className="login__input"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="login__btn" type="submit">
            Registrarse
          </button>

          <p className="login__link">
            ¿Ya tienes cuenta?{' '}
            <span onClick={() => navigate('/login')}>Inicia sesión</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
