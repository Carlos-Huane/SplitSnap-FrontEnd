import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupEmojis } from '../../data/groups'
import { genId } from '../../context/AppContext'
import './CreateGroup.css'

const groupTypes = [
  { emoji: '🏠', label: 'Apartamento' },
  { emoji: '✈️', label: 'Viaje' },
  { emoji: '🍝', label: 'Cena' },
  { emoji: '📦', label: 'Otro' },
]

function CreateGroup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState(null)
  const [selectedEmoji, setSelectedEmoji] = useState(null)

  const handleContinue = () => {
    if (!name.trim()) return
    const emoji = selectedEmoji || (selectedType ? groupTypes.find(t => t.label === selectedType)?.emoji : '📦')
    const newId = genId('g')
    navigate(`/groups/${newId}/invite`, { state: { groupName: name, emoji, isNew: true, newId } })
  }

  return (
    <div className="create-group">
      <div className="create-group__header">
        <button className="create-group__back" onClick={() => navigate('/groups')}>
          ←
        </button>
        <h1 className="create-group__title">Nuevo grupo</h1>
      </div>

      <div className="create-group__form">
        <div className="create-group__photo">
          <div className="create-group__photo-circle">
            <span>{selectedEmoji || '📷'}</span>
          </div>
        </div>

        <div className="create-group__field">
          <label className="create-group__label">Nombre del grupo</label>
          <input
            className="create-group__input"
            type="text"
            placeholder="Ej. Viaje a Barcelona"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="create-group__field">
          <label className="create-group__label">Tipo de grupo</label>
          <div className="create-group__types">
            {groupTypes.map(type => (
              <button
                key={type.label}
                className={`create-group__type-btn ${selectedType === type.label ? 'active' : ''}`}
                onClick={() => {
                  setSelectedType(type.label)
                  setSelectedEmoji(type.emoji)
                }}
              >
                <span>{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="create-group__field">
          <label className="create-group__label">O elige un emoji</label>
          <div className="create-group__emojis">
            {groupEmojis.map(emoji => (
              <button
                key={emoji}
                className={`create-group__emoji-btn ${selectedEmoji === emoji ? 'active' : ''}`}
                onClick={() => setSelectedEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="create-group__footer">
        <button
          className="create-group__submit"
          onClick={handleContinue}
          disabled={!name.trim()}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default CreateGroup
