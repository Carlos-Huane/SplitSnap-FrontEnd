import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp, genId, buildDebts } from '../context/AppContext'
import { users, currentUser } from '../data/global'
import './AddExpense.css'

function AddExpense() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { groups, dispatch } = useApp()

  const group = groups.find(g => g.id === id)
  const members = group
    ? group.memberIds.map(uid => users.find(u => u.id === uid)).filter(Boolean)
    : []

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidBy, setPaidBy] = useState(currentUser.id)
  const [splitMode, setSplitMode] = useState('equal')
  const [customAmounts, setCustomAmounts] = useState(
    () => Object.fromEntries(members.map(m => [m.id, '']))
  )

  const totalAmount = parseFloat(amount) || 0
  const displayAmount = totalAmount > 0 ? totalAmount.toFixed(2) : '0.00'
  const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

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

  const handleSave = () => {
    if (!amount || !description || totalAmount <= 0) return

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

    const expense = {
      id: genId('e'),
      groupId: id,
      description: description.trim(),
      amount: totalAmount,
      paidBy,
      splitBetween,
      date,
      items: [],
    }

    const debts = buildDebts(expense)
    dispatch({ type: 'ADD_EXPENSE', expense, debts })
    navigate(`/groups/${id}`)
  }

  const isValid = totalAmount > 0 && description.trim().length > 0 &&
    (splitMode === 'equal' || Math.abs(customRemaining) < 0.01)

  return (
    <div className="add-expense">
      <div className="add-expense__header">
        <button className="add-expense__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="add-expense__title">Nuevo gasto</h1>
      </div>

      <div className="add-expense__card">
        {/* Monto */}
        <div className="add-expense__amount-section">
          <p className="add-expense__amount-label">Monto</p>
          <div className="add-expense__amount-box">
            <p className="add-expense__amount-value">${displayAmount}</p>
            <input
              className="add-expense__amount-input"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="add-expense__field">
          <input
            className="add-expense__input"
            type="text"
            placeholder="Descripción del gasto"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Fecha */}
        <div className="add-expense__field add-expense__field--date">
          <span className="add-expense__date-icon">📅</span>
          <label className="add-expense__date-label">
            {formatDateDisplay(date)}
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="add-expense__date-hidden"
            />
          </label>
        </div>

        {/* Quién pagó */}
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
                  {member.id === currentUser.id ? 'Tú' : member.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dividir gasto */}
        <div className="add-expense__field">
          <label className="add-expense__label">Dividir gasto</label>
          <div className="add-expense__split-toggle">
            <button
              className={`add-expense__split-btn ${splitMode === 'equal' ? 'active' : ''}`}
              onClick={() => setSplitMode('equal')}
            >
              Partes iguales
            </button>
            <button
              className={`add-expense__split-btn ${splitMode === 'custom' ? 'active' : ''}`}
              onClick={() => setSplitMode('custom')}
            >
              Personalizado
            </button>
          </div>

          {/* Partes iguales — vista previa */}
          {splitMode === 'equal' && totalAmount > 0 && (
            <div className="add-expense__split-preview">
              {members.map((m, idx) => (
                <div key={m.id} className="add-expense__split-row">
                  <div className="add-expense__split-user">
                    <span
                      className="add-expense__split-dot"
                      style={{ background: avatarColors[idx % avatarColors.length] }}
                    />
                    <span>{m.id === currentUser.id ? 'Tú' : m.name.split(' ')[0]}</span>
                  </div>
                  <span className="add-expense__split-amount">
                    ${perPerson.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Personalizado — inputs por persona */}
          {splitMode === 'custom' && (
            <div className="add-expense__split-custom">
              {members.map((m, idx) => (
                <div key={m.id} className="add-expense__custom-row">
                  <div className="add-expense__split-user">
                    <span
                      className="add-expense__split-dot"
                      style={{ background: avatarColors[idx % avatarColors.length] }}
                    />
                    <span>{m.id === currentUser.id ? 'Tú' : m.name.split(' ')[0]}</span>
                  </div>
                  <div className="add-expense__custom-input-wrap">
                    <span className="add-expense__custom-prefix">$</span>
                    <input
                      className="add-expense__custom-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customAmounts[m.id]}
                      onChange={e => setCustomAmounts(prev => ({ ...prev, [m.id]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
              <div className={`add-expense__custom-remaining ${Math.abs(customRemaining) < 0.01 ? 'ok' : customRemaining < 0 ? 'over' : ''}`}>
                {Math.abs(customRemaining) < 0.01
                  ? '✓ Monto distribuido correctamente'
                  : customRemaining > 0
                    ? `Faltan distribuir: $${customRemaining.toFixed(2)}`
                    : `Te excediste por: $${Math.abs(customRemaining).toFixed(2)}`}
              </div>
            </div>
          )}
        </div>

        <button
          className="add-expense__submit"
          onClick={handleSave}
          disabled={!isValid}
        >
          Guardar gasto
        </button>
      </div>
    </div>
  )
}

export default AddExpense
