import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { users, currentUser } from '../data/global'
import { groups } from '../data/groups'
import './InviteMembers.css'

function InviteMembers() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const group = groups.find(g => g.id === id)

  const groupName = location.state?.groupName || group?.name || 'Nuevo grupo'
  const groupEmoji = location.state?.emoji || group?.emoji || '📦'

  const [email, setEmail] = useState('')
  const [members, setMembers] = useState([currentUser])

  const handleInvite = () => {
    if (!email.trim()) return
    const found = users.find(u => u.email === email)
    if (found && !members.find(m => m.id === found.id)) {
      setMembers([...members, found])
      setEmail('')
    }
  }

  const handleRemove = (userId) => {
    if (userId === currentUser.id) return
    setMembers(members.filter(m => m.id !== userId))
  }

  const handleCreate = () => {
    navigate(`/groups/${id}`)
  }

  const getInitial = (name) => name.charAt(0).toUpperCase()
  const colors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']

  return (
    <div className="invite">
      <div className="invite__header">
        <button className="invite__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="invite__title">Invitar miembros</h1>
      </div>

      <div className="invite__content">
        <div className="invite__group-info">
          <span className="invite__group-emoji">{groupEmoji}</span>
          <span className="invite__group-name">{groupName}</span>
        </div>

        <div className="invite__search">
          <input
            className="invite__input"
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <button className="invite__add-btn" onClick={handleInvite}>
            Invitar
          </button>
        </div>

        <div className="invite__list">
          <p className="invite__list-label">Miembros invitados</p>
          {members.map((member, idx) => (
            <div key={member.id} className="invite__member">
              <div
                className="invite__member-avatar"
                style={{ background: colors[idx % colors.length] }}
              >
                {getInitial(member.name)}
              </div>
              <span className="invite__member-name">{member.name}</span>
              {member.id !== currentUser.id && (
                <button
                  className="invite__member-remove"
                  onClick={() => handleRemove(member.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="invite__footer">
        <button className="invite__submit" onClick={handleCreate}>
          Crear grupo
        </button>
      </div>
    </div>
  )
}

export default InviteMembers
