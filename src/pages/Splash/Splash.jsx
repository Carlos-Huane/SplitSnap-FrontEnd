import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Splash.css'

function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login')
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash">
      <div className="splash__content">
        <div className="splash__logo">
          <span>S</span>
        </div>
        <h1 className="splash__title">SplitSnap</h1>
        <p className="splash__tagline">Divide cuentas en segundos</p>
        <div className="splash__loader">
          <div className="splash__loader-bar" />
        </div>
      </div>
    </div>
  )
}

export default Splash
