import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockReceiptItems, groups } from '../data/groups'
import { users, currentUser } from '../data/global'
import './ReviewItems.css'

const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function ReviewItems() {
  const navigate = useNavigate()
  const { id } = useParams()

  const group = groups.find(g => g.id === id)
  const members = group ? group.memberIds.map(uid => users.find(u => u.id === uid)) : []

  const [assignments, setAssignments] = useState(() =>
    Object.fromEntries(mockReceiptItems.map(item => [item.id, group ? [...group.memberIds] : []]))
  )

  const toggleAssign = (itemId, userId) => {
    setAssignments(prev => {
      const current = prev[itemId]
      const isAssigned = current.includes(userId)
      return {
        ...prev,
        [itemId]: isAssigned
          ? current.filter(u => u !== userId)
          : [...current, userId]
      }
    })
  }

  const total = mockReceiptItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Compute per-member summary for the desktop panel
  const memberSummary = members.map((member, idx) => {
    if (!member) return null
    const assignedItems = mockReceiptItems.filter(item =>
      assignments[item.id]?.includes(member.id)
    )
    const assignedCount = assignedItems.length
    const memberTotal = assignedItems.reduce((sum, item) => {
      const splitCount = assignments[item.id]?.length || 1
      return sum + (item.price * item.quantity) / splitCount
    }, 0)
    return { member, idx, assignedCount, memberTotal }
  }).filter(Boolean)

  return (
    <div className="review-items">
      {/* Header */}
      <div className="review-items__header">
        <button className="review-items__back" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="review-items__title">Revisar recibo</h1>
          <p className="review-items__subtitle">Revisa y asigna cada ítem</p>
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="review-items__body">
        {/* Items list */}
        <div className="review-items__list">
          {mockReceiptItems.map(item => {
            const assignedTo = assignments[item.id] || []
            const assignedMembers = members.filter(m => m && assignedTo.includes(m.id))
            return (
              <div key={item.id} className="review-item">
                <div className="review-item__info">
                  <p className="review-item__name">{item.name}</p>
                  <p className="review-item__price">
                    ${(item.price * item.quantity).toFixed(2)}
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
                        style={{ background: assigned ? avatarColors[idx % avatarColors.length] : '#D1D5DB', zIndex: idx }}
                        onClick={() => toggleAssign(item.id, member.id)}
                        title={member.name}
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
                <p className="summary-row__items">{assignedCount} ítem{assignedCount !== 1 ? 's' : ''} asignado{assignedCount !== 1 ? 's' : ''}</p>
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
        <button className="review-items__confirm" onClick={() => navigate(`/groups/${id}/debts`)}>
          Confirmar y dividir
        </button>
      </div>
    </div>
  )
}

export default ReviewItems
