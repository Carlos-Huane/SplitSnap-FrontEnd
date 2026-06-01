import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { createExpense } from '../../services/expenses.service'
import { getGroup } from '../../services/groups.service'
import { getCurrentUserFromToken } from '../../services/auth.service'
import { extractErrorMessage } from '../../services/api'
import './AddExpense.css'

const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function AddExpense() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentUser } = useApp()
  const tokenUser = getCurrentUserFromToken()
  const currentUserId = currentUser?.id || tokenUser?.id

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [loadingGroup, setLoadingGroup] = useState(true)
  const [groupError, setGroupError] = useState(null)

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidBy, setPaidBy] = useState(currentUserId || '')
  const [splitMode, setSplitMode] = useState('equal')
  const [customAmounts, setCustomAmounts] = useState({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Cargar grupo + miembros del backend
  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoadingGroup(true)
    getGroup(id)
      .then((data) => {
        if (cancelled) return
        setGroup(data)
        const fetched = (data?.members || []).map(m => m.user || m).filter(Boolean)
        setMembers(fetched)
        const initialAmounts = Object.fromEntries(fetched.map(m => [m.id, '']))
        setCustomAmounts(initialAmounts)
        if (currentUserId && fetched.some(m => m.id === currentUserId)) {
          setPaidBy(currentUserId)
        } else if (fetched.length > 0) {
          setPaidBy(fetched[0].id)
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 403) {
          setGroupError('No tienes acceso a este grupo.')
        } else if (err.response?.status === 404) {
          setGroupError('Grupo no encontrado.')
        } else {
          setGroupError(extractErrorMessage(err, 'No pudimos cargar el grupo.'))
        }
      })
      .finally(() => { if (!cancelled) setLoadingGroup(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const totalAmount = parseFloat(amount) || 0
  const perPerson = members.length > 0 ? totalAmount / members.length : 0

  const customTotal = Object.values(customAmounts).reduce(
    (sum, v) => sum + (parseFloat(v) || 0), 0
  )
  const customRemaining = parseFloat((totalAmount - customTotal).toFixed(2))

  const formatDateDisplay = (d) => {
    const parsed = new Date(d + 'T00:00:00')
    return parsed.toLocaleDateString('es-PE', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const handleSave = async () => {
    if (!amount || !description || totalAmount <= 0 || isSubmitting) return

    let splitBetween
    if (splitMode === 'equal') {
      splitBetween = members.map(m => ({
        userId: m.id,
        amount: parseFloat((totalAmount / members.length).toFixed(2)),
      }))
    } else {
      splitBetween = members.map(m => ({
        userId: m.id,
        amount: parseFloat(customAmounts[m.id]) || 0,
      }))
    }

    const payload = {
      description: description.trim(),
      amount: totalAmount,
      paidBy,
      date,
      splitBetween,
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      await createExpense(id, payload)
      navigate(`/groups/${id}`)
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, 'No pudimos registrar el gasto.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = totalAmount > 0 && description.trim().length > 0 &&
    members.length > 0 && Boolean(paidBy) &&
    (splitMode === 'equal' || Math.abs(customRemaining) < 0.01) && !isSubmitting

  if (loadingGroup) {
    return (
      <div className="add-expense">
        <div className="add-expense__header">
          <button className="add-expense__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="add-expense__title">Cargando grupo...</h1>
        </div>
      </div>
    )
  }

  if (groupError) {
    return (
      <div className="add-expense">
        <div className="add-expense__header">
          <button className="add-expense__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="add-expense__title">Error</h1>
        </div>
        <p style={{ padding: '1rem', color: '#ff4d4d' }}>⚠️ {groupError}</p>
      </div>
    )
  }

  return (
    <div className="add-expense">
      <div className="add-expense__header">
        <button className="add-expense__back" onClick={() => navigate(-1)} disabled={isSubmitting}>←</button>
        <h1 className="add-expense__title">Nuevo gasto</h1>
      </div>

      <div className="add-expense__card">
        {errorMessage && (
          <div className="add-expense__error-banner">
            ⚠️ {errorMessage}
          </div>
        )}

        <div className="add-expense__amount-section">
          <p className="add-expense__amount-label">Monto</p>
          <div className="add-expense__amount-box-editable">
            <span className="add-expense__currency-symbol">S/</span>
            <input
              className="add-expense__amount-input-visible"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="add-expense__field">
          <input
            className="add-expense__input"
            type="text"
            placeholder="Descripción del gasto"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="add-expense__field add-expense__field--date">
          <span className="add-expense__date-icon">📅</span>
          <label className="add-expense__date-label">
            {formatDateDisplay(date)}
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="add-expense__date-hidden"
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className="add-expense__field">
          <label className="add-expense__label">¿Quién pagó?</label>
          <div className="add-expense__members">
            {members.map((member, idx) => {
              const active = paidBy === member.id
              return (
                <button
                  key={member.id}
                  className={`add-expense__member-btn ${active ? 'active' : ''}`}
                  onClick={() => setPaidBy(member.id)}
                  disabled={isSubmitting}
                  style={active
                    ? { background: avatarColors[idx % avatarColors.length], borderColor: avatarColors[idx % avatarColors.length] }
                    : {}}
                >
                  <span
                    className="add-expense__member-initial"
                    style={{ background: active ? 'rgba(255,255,255,0.3)' : avatarColors[idx % avatarColors.length] }}
                  >
                    {getInitial(member.name)}
                  </span>
                  {member.id === currentUserId ? 'Tú' : (member.name?.split(' ')[0] || 'Usuario')}
                </button>
              )
            })}
          </div>
        </div>

        <div className="add-expense__field">
          <label className="add-expense__label">Dividir gastos</label>
          <div className="add-expense__split-toggle">
            <button
              className={`add-expense__split-btn ${splitMode === 'equal' ? 'active' : ''}`}
              onClick={() => setSplitMode('equal')}
              disabled={isSubmitting}
            >
              Partes iguales
            </button>
            <button
              className={`add-expense__split-btn ${splitMode === 'custom' ? 'active' : ''}`}
              onClick={() => setSplitMode('custom')}
              disabled={isSubmitting}
            >
              Personalizado
            </button>
          </div>

          {splitMode === 'equal' && totalAmount > 0 && (
            <div className="add-expense__split-preview">
              {members.map((m, idx) => (
                <div key={m.id} className="add-expense__split-row">
                  <div className="add-expense__split-user">
                    <span
                      className="add-expense__split-dot"
                      style={{ background: avatarColors[idx % avatarColors.length] }}
                    />
                    <span>{m.id === currentUserId ? 'Tú' : (m.name?.split(' ')[0] || 'Usuario')}</span>
                  </div>
                  <span className="add-expense__split-amount">
                    S/ {perPerson.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {splitMode === 'custom' && (
            <div className="add-expense__split-custom">
              {members.map((m, idx) => (
                <div key={m.id} className="add-expense__custom-row">
                  <div className="add-expense__split-user">
                    <span
                      className="add-expense__split-dot"
                      style={{ background: avatarColors[idx % avatarColors.length] }}
                    />
                    <span>{m.id === currentUserId ? 'Tú' : (m.name?.split(' ')[0] || 'Usuario')}</span>
                  </div>
                  <div className="add-expense__custom-input-wrap">
                    <span className="add-expense__custom-prefix">S/</span>
                    <input
                      className="add-expense__custom-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customAmounts[m.id] ?? ''}
                      onChange={e => setCustomAmounts(prev => ({ ...prev, [m.id]: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
              <div className={`add-expense__custom-remaining ${Math.abs(customRemaining) < 0.01 ? 'ok' : customRemaining < 0 ? 'over' : ''}`}>
                {Math.abs(customRemaining) < 0.01
                  ? '✓ Monto distribuido correctamente'
                  : customRemaining > 0
                    ? `Faltan distribuir: S/ ${customRemaining.toFixed(2)}`
                    : `Te excediste por: S/ ${Math.abs(customRemaining).toFixed(2)}`}
              </div>
            </div>
          )}
        </div>

        <button
          className="add-expense__submit"
          onClick={handleSave}
          disabled={!isValid}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar gasto'}
        </button>
      </div>
    </div>
  )
}

export default AddExpense
