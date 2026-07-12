import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { createExpense } from '../../services/expenses.service'
import { getGroup } from '../../services/groups.service'
import { extractErrorMessage } from '../../services/api'
import { getCurrentUserFromToken } from '../../services/auth.service'
import './ReviewItems.css'

const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function ReviewItems() {
  const navigate = useNavigate()
  const { id: groupId } = useParams()
  const { state } = useLocation()

  const ocr = state || {}
  const tokenUser = getCurrentUserFromToken()

  const [loadingGroup, setLoadingGroup] = useState(true)
  const [members, setMembers] = useState([])
  const [groupError, setGroupError] = useState(null)

  const detectedAmountNumber = typeof ocr.detectedAmount === 'number' ? ocr.detectedAmount : 0
  const ocrFailed = !detectedAmountNumber || detectedAmountNumber <= 0

  const [description, setDescription] = useState(
    ocr.description ? String(ocr.description).replace(/^Escaneo:\s*/, '') : ''
  )
  const [amount, setAmount] = useState(
    detectedAmountNumber > 0 ? detectedAmountNumber.toFixed(2) : ''
  )
  const [paidBy, setPaidBy] = useState(tokenUser?.id || '')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [splits, setSplits] = useState({})

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    setLoadingGroup(true)
    getGroup(groupId)
      .then((data) => {
        if (cancelled) return
        const fetchedMembers = (data?.members || [])
          .map((gm) => gm.user || gm)
          .filter(Boolean)
        setMembers(fetchedMembers)
        const memberIds = fetchedMembers.map((m) => m.id)
        setSelectedMembers(memberIds)
        if (!paidBy && tokenUser?.id && memberIds.includes(tokenUser.id)) {
          setPaidBy(tokenUser.id)
        } else if (!paidBy && memberIds.length > 0) {
          setPaidBy(memberIds[0])
        }
      })
      .catch((err) => {
        if (cancelled) return
        setGroupError(extractErrorMessage(err, 'No pudimos cargar el grupo.'))
      })
      .finally(() => {
        if (!cancelled) setLoadingGroup(false)
      })
    return () => { cancelled = true }
  }, [groupId])

  const amountNumber = useMemo(() => {
    const parsed = parseFloat(amount)
    return Number.isFinite(parsed) ? parsed : 0
  }, [amount])

  // Auto-split equitativo cuando cambian monto o miembros seleccionados
  // Auto-split equitativo. Distribuye centavos de forma exacta: si el total
  // no es divisible parejo, los primeros (remainder) miembros reciben un
  // centavo extra. Ej: 99.50 / 3 -> [33.17, 33.17, 33.16] suman 99.50.
  useEffect(() => {
    if (selectedMembers.length === 0 || amountNumber <= 0) {
      setSplits({})
      return
    }
    const totalCents = Math.round(amountNumber * 100)
    const n = selectedMembers.length
    const baseCents = Math.floor(totalCents / n)
    const remainder = totalCents - baseCents * n
    setSplits((prev) => {
      const next = {}
      selectedMembers.forEach((uid, idx) => {
        const cents = baseCents + (idx < remainder ? 1 : 0)
        next[uid] = prev[uid] !== undefined ? prev[uid] : cents / 100
      })
      return next
    })
  }, [amountNumber, selectedMembers])

  const toggleMember = (uid) => {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    )
  }

  const handleSplitChange = (uid, value) => {
    setSplits((prev) => ({ ...prev, [uid]: value === '' ? '' : parseFloat(value) }))
  }

  const splitsSum = useMemo(
    () => selectedMembers.reduce((acc, uid) => acc + (parseFloat(splits[uid]) || 0), 0),
    [selectedMembers, splits]
  )

  const splitsValid = Math.abs(splitsSum - amountNumber) <= 0.01

  const validate = () => {
    if (!description.trim()) return 'Agrega una descripción.'
    if (amountNumber <= 0) return 'El monto debe ser mayor a 0.'
    if (!paidBy) return 'Selecciona quién pagó.'
    if (selectedMembers.length === 0) return 'Selecciona al menos un miembro para dividir.'
    if (!splitsValid) {
      return `La suma de los splits (S/ ${splitsSum.toFixed(2)}) no coincide con el monto total (S/ ${amountNumber.toFixed(2)}).`
    }
    return null
  }

  const handleConfirm = async () => {
    const validationError = validate()
    if (validationError) {
      setSubmitError(validationError)
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      const payload = {
        description: description.trim(),
        amount: amountNumber,
        paidBy,
        date: new Date().toISOString().split('T')[0],
        splitBetween: selectedMembers.map((uid) => ({
          userId: uid,
          amount: parseFloat((parseFloat(splits[uid]) || 0).toFixed(2)),
        })),
      }
      await createExpense(groupId, payload)
      navigate(`/groups/${groupId}`)
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'No pudimos registrar el gasto. Intenta nuevamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingGroup) {
    return (
      <div className="review-items">
        <div className="review-items__header">
          <button className="review-items__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="review-items__title">Cargando grupo...</h1>
        </div>
      </div>
    )
  }

  if (groupError) {
    return (
      <div className="review-items">
        <div className="review-items__header">
          <button className="review-items__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="review-items__title">Error</h1>
        </div>
        <div className="review-items__list">
          <p className="review-items__error">{groupError}</p>
        </div>
      </div>
    )
  }

  const rawText = Array.isArray(ocr.extractedItems) ? ocr.extractedItems.join('\n') : ''

  return (
    <div className="review-items">
      <div className="review-items__header">
        <button className="review-items__back" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="review-items__title">Revisar recibo</h1>
          <p className="review-items__subtitle">Verifica los datos detectados antes de confirmar</p>
        </div>
      </div>

      {ocrFailed && (
        <div className="review-items__ocr-warning">
          <span className="review-items__ocr-warning-icon">⚠️</span>
          <div>
            <p className="review-items__ocr-warning-title">No detectamos el monto automáticamente</p>
            <p className="review-items__ocr-warning-desc">
              La boleta no tenía un total claro (ej. "TOTAL", "PRECIO VENTA", "IMPORTE TOTAL"). Revisa el texto detectado e ingresa el monto manualmente.
            </p>
          </div>
        </div>
      )}

      <div className="review-items__paid-by">
        <p className="review-items__paid-label">¿Quién pagó el recibo?</p>
        <div className="review-items__paid-members">
          {members.map((m, idx) => (
            <button
              key={m.id}
              className={`review-items__paid-btn ${paidBy === m.id ? 'active' : ''}`}
              style={paidBy === m.id ? { borderColor: avatarColors[idx % avatarColors.length], background: avatarColors[idx % avatarColors.length] } : {}}
              onClick={() => setPaidBy(m.id)}
            >
              <span
                className="review-items__paid-initial"
                style={{ background: paidBy === m.id ? 'rgba(255,255,255,0.3)' : avatarColors[idx % avatarColors.length] }}
              >
                {getInitial(m.name)}
              </span>
              {m.id === tokenUser?.id ? 'Tú' : (m.name || 'Usuario')}
            </button>
          ))}
        </div>
      </div>

      <div className="review-items__body">
        <div className="review-items__list">
          <div className="review-item review-item--editable">
            <label className="review-item__field">
              <span className="review-item__field-label">Descripción</span>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Cena en restaurante"
                className="review-item__field-input"
              />
            </label>
            <label className="review-item__field">
              <span className="review-item__field-label">Monto total (S/)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="review-item__field-input"
              />
            </label>
          </div>

          {rawText && (
            <details className="review-item review-item--ocr">
              <summary>Ver texto extraído del recibo</summary>
              <pre className="review-item__ocr-text">{rawText}</pre>
            </details>
          )}

          <div className="review-item review-item--splits">
            <p className="review-item__name">Dividir entre</p>
            <div className="review-item__splits-list">
              {members.map((m, idx) => {
                const checked = selectedMembers.includes(m.id)
                return (
                  <div key={m.id} className="split-row">
                    <label className="split-row__check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(m.id)}
                      />
                      <span
                        className="split-row__avatar"
                        style={{ background: avatarColors[idx % avatarColors.length] }}
                      >
                        {getInitial(m.name)}
                      </span>
                      <span className="split-row__name">
                        {m.id === tokenUser?.id ? 'Tú' : (m.name || 'Usuario')}
                      </span>
                    </label>
                    {checked && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={splits[m.id] ?? ''}
                        onChange={(e) => handleSplitChange(m.id, e.target.value)}
                        className="split-row__amount"
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <p className={`review-item__splits-status ${splitsValid ? 'ok' : 'mismatch'}`}>
              Suma de splits: S/ {splitsSum.toFixed(2)} / S/ {amountNumber.toFixed(2)}
              {splitsValid ? ' ✓' : ' ✗ (no coincide)'}
            </p>
          </div>
        </div>

        <div className="review-items__summary">
          <h2 className="review-items__summary-title">Resumen</h2>
          {selectedMembers.map((uid) => {
            const member = members.find((x) => x.id === uid)
            if (!member) return null
            const idx = members.indexOf(member)
            return (
              <div key={uid} className="summary-row">
                <div className="summary-row__dot" style={{ background: avatarColors[idx % avatarColors.length] }} />
                <div className="summary-row__info">
                  <p className="summary-row__name">
                    {member.id === tokenUser?.id ? 'Tú' : (member.name || 'Usuario')}
                  </p>
                </div>
                <span className="summary-row__amount">
                  S/ {(parseFloat(splits[uid]) || 0).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {submitError && (
        <div className="review-items__submit-error">{submitError}</div>
      )}

      <div className="review-items__footer">
        <div className="review-items__total">
          <span className="review-items__total-label">Total</span>
          <span className="review-items__total-amount">S/ {amountNumber.toFixed(2)}</span>
        </div>
        <button
          className="review-items__confirm"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Confirmar y dividir'}
        </button>
      </div>
    </div>
  )
}

export default ReviewItems
