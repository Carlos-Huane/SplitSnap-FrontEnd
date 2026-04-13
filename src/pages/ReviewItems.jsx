import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockReceiptItems } from '../data/groups'
import { users, currentUser } from '../data/global'
import { useApp, genId, buildDebts } from '../context/AppContext'
import './ReviewItems.css'

const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function ReviewItems() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { groups, dispatch } = useApp()

  const group = groups.find(g => g.id === id)
  const members = group
    ? group.memberIds.map(uid => users.find(u => u.id === uid)).filter(Boolean)
    : []

  // Por defecto: todos los ítems asignados a todos los miembros
  const [assignments, setAssignments] = useState(() =>
    Object.fromEntries(mockReceiptItems.map(item => [item.id, members.map(m => m.id)]))
  )
  const [paidBy, setPaidBy] = useState(currentUser.id)

  const toggleAssign = (itemId, userId) => {
    setAssignments(prev => {
      const current = prev[itemId]
      const isAssigned = current.includes(userId)
      return {
        ...prev,
        [itemId]: isAssigned
          ? current.filter(u => u !== userId)
          : [...current, userId],
      }
    })
  }

  const total = mockReceiptItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Resumen por miembro
  const memberSummary = members.map((member, idx) => {
    if (!member) return null
    const assignedItems = mockReceiptItems.filter(item =>
      assignments[item.id]?.includes(member.id)
    )
    const memberTotal = assignedItems.reduce((sum, item) => {
      const splitCount = assignments[item.id]?.length || 1
      return sum + (item.price * item.quantity) / splitCount
    }, 0)
    return { member, idx, assignedCount: assignedItems.length, memberTotal }
  }).filter(Boolean)

  const handleConfirm = () => {
    // Construir splitBetween desde resumen de miembros
    const splitBetween = memberSummary.map(({ member, memberTotal }) => ({
      userId: member.id,
      amount: parseFloat(memberTotal.toFixed(2)),
    }))

    const expense = {
      id: genId('e'),
      groupId: id,
      description: 'Recibo escaneado',
      amount: parseFloat(total.toFixed(2)),
      paidBy,
      splitBetween,
      date: new Date().toISOString().split('T')[0],
      items: mockReceiptItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        assignedTo: assignments[item.id] || [],
      })),
    }

    const debts = buildDebts(expense)
    dispatch({ type: 'ADD_EXPENSE', expense, debts })
    navigate(`/groups/${id}/debts`)
  }

  return (
    <div className="review-items">
      {/* Header */}
      <div className="review-items__header">
        <button className="review-items__back" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="review-items__title">Revisar recibo</h1>
          <p className="review-items__subtitle">Asigna cada ítem a quien lo consumió</p>
        </div>
      </div>

      {/* Quién pagó */}
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
              {m.id === currentUser.id ? 'Tú' : m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="review-items__body">
        {/* Items list */}
        <div className="review-items__list">
          {mockReceiptItems.map(item => {
            const assignedTo = assignments[item.id] || []
            return (
              <div key={item.id} className="review-item">
                <div className="review-item__info">
                  <p className="review-item__name">{item.name}</p>
                  <p className="review-item__price">
                    ${(item.price * item.quantity).toFixed(2)}
                    {item.quantity > 1 && (
                      <span className="review-item__qty"> ×{item.quantity}</span>
                    )}
                  </p>
                </div>
                <div className="review-item__avatars">
                  {members.map((member, idx) => {
                    if (!member) return null
                    const assigned = assignedTo.includes(member.id)
                    return (
                      <button
                        key={member.id}
                        className={`review-item__avatar ${assigned ? 'assigned' : 'unassigned'}`}
                        style={{
                          background: assigned ? avatarColors[idx % avatarColors.length] : '#D1D5DB',
                          zIndex: idx,
                        }}
                        onClick={() => toggleAssign(item.id, member.id)}
                        title={member.id === currentUser.id ? 'Tú' : member.name.split(' ')[0]}
                      >
                        {getInitial(member.name)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary panel — desktop only */}
        <div className="review-items__summary">
          <h2 className="review-items__summary-title">Resumen de división</h2>
          {memberSummary.map(({ member, idx, assignedCount, memberTotal }) => (
            <div key={member.id} className="summary-row">
              <div
                className="summary-row__dot"
                style={{ background: avatarColors[idx % avatarColors.length] }}
              />
              <div className="summary-row__info">
                <p className="summary-row__name">
                  {member.id === currentUser.id ? 'Tú' : member.name.split(' ')[0]}
                </p>
                <p className="summary-row__items">
                  {assignedCount} ítem{assignedCount !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="summary-row__amount">${memberTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="review-items__footer">
        <div className="review-items__total">
          <span className="review-items__total-label">Total</span>
          <span className="review-items__total-amount">${total.toFixed(2)}</span>
        </div>
        <button className="review-items__confirm" onClick={handleConfirm}>
          Confirmar y dividir
        </button>
      </div>
    </div>
  )
}

export default ReviewItems
