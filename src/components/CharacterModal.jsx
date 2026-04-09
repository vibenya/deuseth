import { useEffect } from 'react'
import '../styles/Modal.css'
import '../styles/CharacterModal.css'

export default function CharacterModal({ character, status, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!character) return null

  const statusLabel = {
    alive: 'Alive',
    'died-now': 'Died This Episode',
    dead: 'Fallen',
    reborn: 'Reborn',
  }

  return (
    <div className="modal char-modal" onClick={onClose}>
      <div className="modal__content char-modal__content" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <svg viewBox="0 0 20 20" fill="#fff"><path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"/></svg>
        </button>
        <div className="char-modal__hero">
          <img src={character.preview} alt={character.name} className="char-modal__img" />
        </div>
        <h3>{character.name}</h3>
        <span className={`char-modal__status char-modal__status--${status}`}>
          {statusLabel[status] || status}
        </span>
        <span className={
          'char-modal__price' +
          (character.lastSalePrice >= 1.0 ? ' char-modal__price--gold' :
           character.lastSalePrice >= 0.5 ? ' char-modal__price--warm' : '')
        }>
          {character.lastSalePrice != null
            ? `Last sold for Ξ ${character.lastSalePrice}`
            : 'Never sold on-chain'}
        </span>
        <p className="char-modal__bio">{character.bio}</p>
      </div>
    </div>
  )
}
