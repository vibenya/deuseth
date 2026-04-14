import { useState, useMemo } from 'react'
import { mainCast } from './CharacterList'
import '../styles/DraftScreen.css'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Props: onComplete(ids: number[])
export default function DraftScreen({ onComplete }) {
  const [selected, setSelected] = useState([])
  const shuffled = useMemo(() => shuffle(mainCast), [])

  function handleCardClick(character) {
    if (selected.includes(character.id)) return
    if (selected.length >= 3) return
    setSelected(prev => [...prev, character.id])
  }

  function handleStart() {
    if (selected.length === 3) onComplete(selected)
  }

  return (
    <div className="draft">
      <div className="draft__header">
        <h1 className="draft__title">Выбери трёх.</h1>
        <p className="draft__subtitle">Вслепую. Второго шанса не будет.</p>
      </div>

      <div className="draft__grid">
        {shuffled.map(character => {
          const isFlipped = selected.includes(character.id)
          return (
            <div
              key={character.id}
              className={`draft-card${isFlipped ? ' draft-card--flipped' : ''}`}
              onClick={() => handleCardClick(character)}
            >
              <div className="draft-card__inner">
                <div className="draft-card__back">
                  <span className="draft-card__symbol">✦</span>
                </div>
                <div className="draft-card__front">
                  <img
                    src={character.preview}
                    alt={character.name}
                    className="draft-card__img"
                  />
                  <div className="draft-card__info">
                    <div className="draft-card__name">{character.name}</div>
                    <div className="draft-card__price">
                      {character.lastSalePrice != null ? `Ξ ${character.lastSalePrice}` : '—'}
                    </div>
                    <div className="draft-card__bio">{character.bio}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="draft__footer">
        <button
          className={`draft__btn${selected.length === 3 ? ' draft__btn--visible' : ''}`}
          onClick={handleStart}
          disabled={selected.length < 3}
        >
          Начать шоу
        </button>
      </div>
    </div>
  )
}
