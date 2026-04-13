import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { mockReceiptItems, groups } from '../data/groups'
import { users, currentUser } from '../data/global'
import './ReviewItems.css'

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
  const avatarColors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'
  const memberIdx = (userId) => members.findIndex(m => m?.id === userId)

  const handleConfirm = () => {
    navigate(`/groups/${id}/debts`)
  }

  return (
    <div className="review-items">
      <div className="review-items__header">
        <button className="review-items__back" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1 className="review-items__title">Revisar recibo</h1>
          <p className="review-items__subtitle">Revisa y asigna cada ítem</p>
        </div>
      </div>

      <div className="review-items__list">
        {mockReceiptItems.map(item => {
          const assignedTo = assignments[item.id] || []
          return (
            <div key={item.id} className="review-item">
              <div className="review-item__info">
                <p className="review-item__name">{item.name}</p>
                <p className="review-item__price">
                  ${(item.price * item.quantity).toFixed(2)}
                  {item.quantity > 1 && <span className="review-item__qty"> ×{item.quantity}</span>}
                </p>
              </div>
              <div className="review-item__avatars">
                {members.map((member, idx) => {
                  if (!member) return null
                  const assigned = assignedTo.includes(member.id)
                  return (
                    <button
                      key={member.id}
                      className={`review-item__avatar ${assigned ? 'assigned' : ''}`}
                      style={assigned
                        ? { background: avatarColors[idx % avatarColors.length] }
                        : { background: '#E5E7EB' }}
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

      <div className="review-items__footer">
        <div className="review-items__total">
          <span>Total:</span>
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
