import { useNavigate } from 'react-router-dom'
import { groups, expenses } from '../data'
import { users } from '../data/global'
import './GroupList.css'

function GroupList() {
  const navigate = useNavigate()

  const getGroupTotal = (groupId) => {
    return expenses
      .filter(e => e.groupId === groupId)
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const getMemberCount = (memberIds) => memberIds.length

  if (groups.length === 0) {
    navigate('/empty')
    return null
  }

  return (
    <div className="group-list">
      <div className="group-list__header">
        <h1 className="group-list__title">Mis grupos</h1>
        <button className="group-list__search-btn" aria-label="Buscar">
          <span>🔍</span>
        </button>
      </div>

      <div className="group-list__grid">
        {groups.map(group => {
          const total = getGroupTotal(group.id)
          const memberCount = getMemberCount(group.memberIds)

          return (
            <div
              key={group.id}
              className="group-card"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="group-card__icon">
                <span>{group.emoji}</span>
              </div>
              <div className="group-card__info">
                <h3 className="group-card__name">{group.name}</h3>
                <p className="group-card__members">{memberCount} miembros</p>
              </div>
              <div className="group-card__amount">
                <span className="group-card__total">${total.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                <span className="group-card__dot" />
              </div>
            </div>
          )
        })}
      </div>

      <button
        className="group-list__fab"
        onClick={() => navigate('/groups/new')}
        aria-label="Crear grupo"
      >
        +
      </button>
    </div>
  )
}

export default GroupList
