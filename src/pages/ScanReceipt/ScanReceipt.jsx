import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { scanReceipt } from '../../services/expenses.service'
import { extractErrorMessage } from '../../services/api'
import './ScanReceipt.css'

function ScanReceipt() {
  const navigate = useNavigate()
  const { id } = useParams()

  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelected = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setError(null)
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleReset = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setError(null)
  }

  const handleScan = async () => {
    if (!file) return
    setScanning(true)
    setError(null)
    try {
      const result = await scanReceipt(file)
      navigate(`/groups/${id}/scan/review`, {
        state: {
          description: result?.description ?? '',
          detectedAmount: result?.detectedAmount ?? 0,
          extractedItems: result?.extractedItems ?? [],
          confidenceScore: result?.confidenceScore ?? null,
        },
      })
    } catch (err) {
      setError(extractErrorMessage(err, 'No pudimos leer el recibo. Intenta con otra foto o ingrésalo manual.'))
      setScanning(false)
    }
  }

  const handleManualEntry = () => {
    navigate(`/groups/${id}/add-expense`)
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
            <p className="scan-receipt__scan-text">Leyendo recibo...</p>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Recibo seleccionado"
            className="scan-receipt__preview"
          />
        ) : (
          <div className="scan-receipt__placeholder">
            <span>📄</span>
            <p>Toma una foto o sube una imagen</p>
          </div>
        )}
        <div className="scan-receipt__corners">
          <span className="corner tl" /><span className="corner tr" />
          <span className="corner bl" /><span className="corner br" />
        </div>
      </div>

      {error && (
        <div className="scan-receipt__error">
          <p>{error}</p>
          <button onClick={handleManualEntry} className="scan-receipt__error-link">
            Ingresar manual →
          </button>
        </div>
      )}

      {!previewUrl && !error && (
        <p className="scan-receipt__hint">Toma una foto del recibo o súbelo desde tu galería</p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />

      <div className="scan-receipt__controls">
        {!previewUrl ? (
          <>
            <button
              className="scan-receipt__shutter"
              onClick={() => cameraInputRef.current?.click()}
              disabled={scanning}
              aria-label="Tomar foto"
            />
            <button
              className="scan-receipt__gallery"
              onClick={() => galleryInputRef.current?.click()}
              disabled={scanning}
            >
              Subir desde galería
            </button>
          </>
        ) : (
          <>
            <button
              className="scan-receipt__review-btn"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? 'Procesando...' : 'Escanear recibo →'}
            </button>
            <button
              className="scan-receipt__gallery"
              onClick={handleReset}
              disabled={scanning}
            >
              Elegir otra imagen
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ScanReceipt
