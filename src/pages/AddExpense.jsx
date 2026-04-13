import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { groups } from '../data/groups'
import { users, currentUser } from '../data/global'
import './AddExpense.css'

function AddExpense() {
  const navigate = useNavigate()
  const { id } = useParams()

  const group = groups.find(g => g.id === id)
  const members = group ? group.memberIds.map(uid => users.find(u => u.id === uid)) : []

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidBy, setPaidBy] = useState(currentUser.id)
  const [splitMode, setSplitMode] = useState('equal')

  const displayAmount = amount ? parseFloat(amount).toFixed(2) : '0.00'

  const handleSave = () => {
    if (!amount || !description) return
    navigate(`/groups/${id}`)
  }

  const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

  const formatDateDisplay = (d) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="add-expense">
      <div className="add-expense__header">
        <button className="add-expense__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="add-expense__title">Nuevo gasto</h1>
      </div>

      <div className="add-expense__card">
        {/* Monto display */}
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
              if (!member) return null
              const active = paidBy === member.id
              return (
                <button
                  key={member.id}
                  className={`add-expense__member-btn ${active ? 'active' : ''}`}
                  onClick={() => setPaidBy(member.id)}
                  style={active ? { background: avatarColors[idx % avatarColors.length], borderColor: avatarColors[idx % avatarColors.length] } : {}}
                >
                  <span className="add-expense__member-initial"
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
        </div>

        <button
          className="add-expense__submit"
          onClick={handleSave}
          disabled={!amount || !description}
        >
          Guardar gasto
        </button>
      </div>
    </div>
  )
}

export default AddExpense
