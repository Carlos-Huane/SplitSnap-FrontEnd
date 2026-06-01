import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { createGroup, getGroup, addMember } from '../../services/groups.service'
import { search as searchUsers } from '../../services/users.service'
import { extractErrorMessage } from '../../services/api'
import './InviteMembers.css'

const colors = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#EF4444']
const getInitial = (name) => name?.charAt(0).toUpperCase() || '?'

function InviteMembers() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const { currentUser } = useApp()
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  const isNew = location.state?.isNew || id === 'new'
  const groupNameFromState = location.state?.groupName || 'Nuevo grupo'
  const groupEmojiFromState = location.state?.emoji || '📦'

  const [group, setGroup] = useState(null)
  const [groupName, setGroupName] = useState(groupNameFromState)
  const [groupEmoji, setGroupEmoji] = useState(groupEmojiFromState)
  const [loadingGroup, setLoadingGroup] = useState(!isNew)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [members, setMembers] = useState(currentUser ? [currentUser] : [])

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Cargar grupo existente si no es nuevo
  useEffect(() => {
    if (isNew || !id) return
    let cancelled = false
    setLoadingGroup(true)
    getGroup(id)
      .then((data) => {
        if (cancelled) return
        setGroup(data)
        setGroupName(data?.name || groupName)
        setGroupEmoji(data?.emoji || groupEmoji)
        const existingMembers = (data?.members || [])
          .map((m) => m.user || m)
          .filter(Boolean)
        setMembers(existingMembers)
      })
      .catch((err) => {
        if (cancelled) return
        setSubmitError(extractErrorMessage(err, 'No pudimos cargar el grupo.'))
      })
      .finally(() => { if (!cancelled) setLoadingGroup(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew])

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

  // Búsqueda con debounce contra el backend
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timer = setTimeout(() => {
      searchUsers(q)
        .then((data) => {
          const filtered = (data || []).filter(u =>
            u.id !== currentUser?.id && !members.some(m => m.id === u.id)
          )
          setResults(filtered)
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, members, currentUser?.id])

  const addMemberLocal = (user) => {
    setMembers(prev => [...prev, user])
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  const removeMemberLocal = (userId) => {
    if (userId === currentUser?.id) return
    setMembers(prev => prev.filter(m => m.id !== userId))
  }

  const handleCreate = async () => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (isNew) {
        // Backend agrega al creador automáticamente; mandamos los demás miembros
        const memberIds = members
          .filter(m => m.id !== currentUser?.id)
          .map(m => m.id)
        const newGroup = await createGroup({
          name: groupName,
          emoji: groupEmoji,
          memberIds,
        })
        navigate(`/groups/${newGroup.id}`, { replace: true })
      } else {
        // Solo invitar a los miembros que aún no están en el grupo
        const existingIds = new Set(
          (group?.members || []).map(m => (m.user || m).id)
        )
        const toAdd = members.filter(m => m.id && !existingIds.has(m.id) && m.id !== currentUser?.id)
        for (const m of toAdd) {
          try {
            await addMember(id, m.id)
          } catch (err) {
            const status = err.response?.status
            const msg = err.response?.data?.message || ''
            // 409 segun la guia, 400 segun lo que devuelve el backend hoy
            const isAlreadyMember = status === 409 ||
              (status === 400 && /ya.+(es.+miembro|miembro.+del.+grupo)/i.test(msg))
            if (!isAlreadyMember) throw err
          }
        }
        navigate(`/groups/${id}`)
      }
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'No pudimos guardar los cambios.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingGroup) {
    return (
      <div className="invite">
        <div className="invite__header">
          <button className="invite__back" onClick={() => navigate(-1)}>←</button>
          <h1 className="invite__title">Cargando grupo...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="invite">
      <div className="invite__header">
        <button className="invite__back" onClick={() => navigate(-1)}>←</button>
        <h1 className="invite__title">{isNew ? 'Invitar miembros' : 'Agregar miembros'}</h1>
      </div>

      <div className="invite__body">
        <div className="invite__panel">
          <div className="invite__group-info">
            <span className="invite__group-emoji">{groupEmoji}</span>
            <div>
              <p className="invite__group-name">{groupName}</p>
              <p className="invite__group-meta">{members.length} miembro{members.length !== 1 ? 's' : ''} añadido{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="invite__search-wrap">
            <label className="invite__search-label">Agregar personas</label>
            <div className="invite__search-field">
              <span className="invite__search-icon">🔍</span>
              <input
                ref={inputRef}
                className="invite__search-input"
                type="text"
                placeholder="Buscar por nombre o correo (min. 2 caracteres)..."
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                autoComplete="off"
              />
              {query && (
                <button className="invite__search-clear" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}>
                  ✕
                </button>
              )}
            </div>

            {open && query.trim().length >= 2 && (
              <div className="invite__dropdown" ref={dropdownRef}>
                {searching ? (
                  <div className="invite__dropdown-empty">Buscando...</div>
                ) : results.length === 0 ? (
                  <div className="invite__dropdown-empty">
                    Sin resultados para "{query}"
                  </div>
                ) : (
                  results.map((u, idx) => (
                    <button
                      key={u.id}
                      className="invite__dropdown-item"
                      onMouseDown={(e) => { e.preventDefault(); addMemberLocal(u) }}
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
                    {member.id === currentUser?.id ? `${member.name} (tú)` : member.name}
                  </span>
                  <span className="invite__member-email">{member.email}</span>
                </div>
                {member.id !== currentUser?.id && (
                  <button
                    className="invite__member-remove"
                    onClick={() => removeMemberLocal(member.id)}
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

      {submitError && (
        <p style={{ color: '#ff4d4d', padding: '0 1rem', textAlign: 'center' }}>⚠️ {submitError}</p>
      )}

      <div className="invite__footer">
        <button
          className="invite__submit"
          onClick={handleCreate}
          disabled={members.length < 1 || submitting}
        >
          {submitting
            ? 'Guardando...'
            : isNew
              ? `Crear grupo · ${members.length} miembro${members.length !== 1 ? 's' : ''}`
              : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

export default InviteMembers
