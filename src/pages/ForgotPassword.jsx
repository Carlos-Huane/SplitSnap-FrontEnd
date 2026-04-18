import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ForgotPassword.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email', 'code', 'password'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    if (!email) {
      setErrorMessage('Por favor ingresa tu correo electrónico')
      return
    }

    setIsLoading(true)
    // Simular envío de código
    setTimeout(() => {
      setSuccessMessage('Código de recuperación enviado a tu correo')
      setStep('code')
      setIsLoading(false)
    }, 1000)
  }

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!code || code.length !== 6) {
      setErrorMessage('Ingresa un código válido de 6 dígitos')
      return
    }

    setIsLoading(true)
    // Simular validación del código
    setTimeout(() => {
      setSuccessMessage('Código validado correctamente')
      setStep('password')
      setIsLoading(false)
    }, 1000)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Por favor completa ambos campos')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    // Simular actualización de contraseña
    setTimeout(() => {
      setSuccessMessage('¡Contraseña actualizada exitosamente!')
      setIsLoading(false)
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    }, 1000)
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password__brand">
        <div className="forgot-password__brand-content">
          <div className="forgot-password__logo">S</div>
          <h1 className="forgot-password__brand-name">SplitSnap</h1>
          <p className="forgot-password__brand-tagline">
            Recupera tu acceso en minutos
          </p>
        </div>
      </div>

      <div className="forgot-password__form-side">
        <div className="forgot-password__form-container">
          <button 
            className="forgot-password__back-btn"
            onClick={() => navigate('/login')}
          >
            ← Volver
          </button>

          {step === 'email' && (
            <form className="forgot-password__form" onSubmit={handleEmailSubmit}>
              <h2 className="forgot-password__form-title">Recuperar Contraseña</h2>
              <p className="forgot-password__form-subtitle">
                Ingresa tu correo electrónico para recibir un código de recuperación
              </p>

              <div className="forgot-password__field">
                <label className="forgot-password__label">Correo electrónico</label>
                <input
                  className="forgot-password__input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {errorMessage && (
                <div className="forgot-password__message forgot-password__message--error">
                  ⚠️ {errorMessage}
                </div>
              )}

              <button 
                className="forgot-password__btn" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form className="forgot-password__form" onSubmit={handleCodeSubmit}>
              <h2 className="forgot-password__form-title">Verifica tu Código</h2>
              <p className="forgot-password__form-subtitle">
                Ingresa el código de 6 dígitos que enviamos a {email}
              </p>

              <div className="forgot-password__field">
                <label className="forgot-password__label">Código de recuperación</label>
                <input
                  className="forgot-password__input forgot-password__input--code"
                  type="text"
                  placeholder="000000"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {errorMessage && (
                <div className="forgot-password__message forgot-password__message--error">
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="forgot-password__message forgot-password__message--success">
                  ✓ {successMessage}
                </div>
              )}

              <button 
                className="forgot-password__btn" 
                type="submit"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </button>

              <p className="forgot-password__resend">
                ¿No recibiste el código?{' '}
                <span onClick={() => setSuccessMessage('Código reenviado')}>
                  Reenviar
                </span>
              </p>
            </form>
          )}

          {step === 'password' && (
            <form className="forgot-password__form" onSubmit={handlePasswordSubmit}>
              <h2 className="forgot-password__form-title">Nueva Contraseña</h2>
              <p className="forgot-password__form-subtitle">
                Ingresa tu nueva contraseña
              </p>

              <div className="forgot-password__fields">
                <div className="forgot-password__field">
                  <label className="forgot-password__label">Nueva Contraseña</label>
                  <input
                    className="forgot-password__input"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="forgot-password__field">
                  <label className="forgot-password__label">Confirmar Contraseña</label>
                  <input
                    className="forgot-password__input"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="forgot-password__message forgot-password__message--error">
                  ⚠️ {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="forgot-password__message forgot-password__message--success">
                  ✓ {successMessage}
                </div>
              )}

              <button 
                className="forgot-password__btn" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
