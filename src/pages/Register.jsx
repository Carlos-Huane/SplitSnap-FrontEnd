import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { users } from '../data/global' 
import './Login.css'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', 
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const exists = users.some((u) => u.email === formData.email)
    if (exists) {
      setError('Este correo ya está registrado.')
      return
    }

    const newUser = {
      id: `u${users.length + 1}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone, 
      password: formData.password,
      avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
      currency: 'PEN',
      createdAt: new Date().toISOString().split('T')[0],
    }

    users.push(newUser)

    console.log('Usuario registrado:', newUser)
    alert('Cuenta creada exitosamente.')
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

            {/* --- NUEVO CAMPO DE TELÉFONO --- */}
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