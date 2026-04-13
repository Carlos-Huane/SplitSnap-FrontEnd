import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { users, currentUser } from '../data/global'
import { useApp } from '../context/AppContext'
import './InviteMembers.css'

const colors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function InviteMembers() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const { groups, dispatch } = useApp()
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const isNew = location.state?.isNew || false
  const group = isNew ? null : groups.find(g => g.id === id)

  const groupName = location.state?.groupName || group?.name || 'Nuevo grupo'
  const groupEmoji = location.state?.emoji || group?.emoji || '📦'

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState([currentUser])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Lista de usuarios disponibles para invitar (excluye ya añadidos)
  const available = users.filter(u =>
    u.id !== currentUser.id &&
    !members.find(m => m.id === u.id) &&
    (query.length === 0 ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()))
  )

  const addMember = (user) => {
    setMembers(prev => [...prev, user])
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeMember = (userId) => {
    if (userId === currentUser.id) return
    setMembers(prev => prev.filter(m => m.id !== userId))
  }

  const handleCreate = () => {
    if (isNew) {
      const newGroup = {
        id: location.state?.newId || id,
        name: groupName,
        emoji: groupEmoji,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString().split('T')[0],
        memberIds: members.map(m => m.id),
      }
      dispatch({ type: 'ADD_GROUP', group: newGroup })
      navigate(`/groups/${newGroup.id}`, { replace: true })
    } else {
      members.forEach(m => {
        if (!group?.memberIds.includes(m.id)) {
          dispatch({ type: 'ADD_MEMBER_TO_GROUP', groupId: id, userId: m.id })
        }
      })
      navigate(`/groups/${id}`)
    }
  }

  return (
    <div className="invite">
      <div className="invite__header">
        <button className="invite__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="invite__title">Invitar miembros</h1>
      </div>

      <div className="invite__body">
        {/* Panel izquierdo (o único en mobile) */}
        <div className="invite__panel">
          <div className="invite__group-info">
            <span className="invite__group-emoji">{groupEmoji}</span>
            <div>
              <p className="invite__group-name">{groupName}</p>
              <p className="invite__group-meta">{members.length} miembro{members.length !== 1 ? 's' : ''} añadido{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Campo de búsqueda + dropdown */}
          <div className="invite__search-wrap">
            <label className="invite__search-label">Agregar personas</label>
            <div className="invite__search-field">
              <span className="invite__search-icon">🔍</span>
              <input
                ref={inputRef}
                className="invite__search-input"
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                autoComplete="off"
              />
              {query && (
                <button className="invite__search-clear" onClick={() => { setQuery(''); setOpen(true); inputRef.current?.focus() }}>
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown */}
            {open && (
              <div className="invite__dropdown" ref={dropdownRef}>
                {available.length === 0 ? (
                  <div className="invite__dropdown-empty">
                    {query
                      ? `Sin resultados para "${query}"`
                      : 'Todos los usuarios ya fueron añadidos'}
                  </div>
                ) : (
                  available.map((u, idx) => (
                    <button
                      key={u.id}
                      className="invite__dropdown-item"
                      onMouseDown={(e) => { e.preventDefault(); addMember(u) }}
                    >
                      <div
                        className="invite__dropdown-avatar"
                        style={{ background: colors[idx % colors.length] }}
                      >
                        {getInitial(u.name)}
                      </div>
                      <div className="invite__dropdown-info">
                        <span className="invite__dropdown-name">{u.name}</span>
                        <span className="invite__dropdown-email">{u.email}</span>
                      </div>
                      <span className="invite__dropdown-add">+ Añadir</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho — lista de miembros añadidos */}
        <div className="invite__panel invite__panel--members">
          <p className="invite__list-label">
            Miembros del grupo
            <span className="invite__list-count">{members.length}</span>
          </p>
          <div className="invite__list">
            {members.map((member, idx) => (
              <div key={member.id} className="invite__member">
                <div
                  className="invite__member-avatar"
                  style={{ background: colors[idx % colors.length] }}
                >
                  {getInitial(member.name)}
                </div>
                <div className="invite__member-info">
                  <span className="invite__member-name">
                    {member.id === currentUser.id ? `${member.name} (tú)` : member.name}
                  </span>
                  <span className="invite__member-email">{member.email}</span>
                </div>
                {member.id !== currentUser.id && (
                  <button
                    className="invite__member-remove"
                    onClick={() => removeMember(member.id)}
                    aria-label="Quitar"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="invite__footer">
        <button
          className="invite__submit"
          onClick={handleCreate}
          disabled={members.length < 1}
        >
          {isNew
            ? `Crear grupo · ${members.length} miembro${members.length !== 1 ? 's' : ''}`
            : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

export default InviteMembers
