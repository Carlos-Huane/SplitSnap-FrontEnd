import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockReceiptItems } from '../../data/groups'
import './ScanReceipt.css'

function ScanReceipt() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanned(true)
    }, 1800)
  }

  const handleReview = () => {
    navigate(`/groups/${id}/scan/review`)
  }

  return (
    <div className="scan-receipt">
      <div className="scan-receipt__header">
        <button className="scan-receipt__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="scan-receipt__title">Escanear recibo</h1>
      </div>

      <div className="scan-receipt__viewfinder">
        {scanning ? (
          <div className="scan-receipt__scanning">
            <div className="scan-receipt__scan-line" />
            <p className="scan-receipt__scan-text">Analizando recibo...</p>
          </div>
        ) : scanned ? (
          <div className="scan-receipt__success">
            <span className="scan-receipt__success-icon">✓</span>
            <p>Recibo detectado</p>
            <p className="scan-receipt__items-found">{mockReceiptItems.length} ítems encontrados</p>
          </div>
        ) : (
          <div className="scan-receipt__placeholder">
            <span>📄</span>
            <p>Enfoca el recibo</p>
          </div>
        )}
        <div className="scan-receipt__corners">
          <span className="corner tl" /><span className="corner tr" />
          <span className="corner bl" /><span className="corner br" />
        </div>
      </div>

      <p className="scan-receipt__hint">Toma una foto del recibo</p>

      <div className="scan-receipt__controls">
        {!scanned ? (
          <>
            <button
              className="scan-receipt__shutter"
              onClick={handleScan}
              disabled={scanning}
              aria-label="Capturar"
            />
            <button
              className="scan-receipt__gallery"
              onClick={handleScan}
            >
              Subir desde galería
            </button>
          </>
        ) : (
          <button className="scan-receipt__review-btn" onClick={handleReview}>
            Revisar ítems →
          </button>
        )}
      </div>
    </div>
  )
}

export default ScanReceipt
