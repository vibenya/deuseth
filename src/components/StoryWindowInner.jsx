import characters from '../data/characters.json'
import BlockRenderer from './BlockRenderer'
import '../styles/StoryWindow.css'

export default function StoryWindowInner({ heroId, content, path, title, dark, onClose }) {
  const hero = characters.find((c) => c.id === heroId)

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="story-win" onClick={handleOverlayClick}>
      <div className={`story-win__inner${dark ? ' story-win__inner--dark' : ''}`}>
        <button className="story-win__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7z"
              fill="#333"
            />
          </svg>
        </button>

        <div className="story-win__wrap">
          {hero && (
            <div className="story-win__header">
              <div className="story-win__header-inner">
                <div className="story-win__image">
                  <img src={hero.preview} alt={hero.name} />
                </div>
                <div className="story-win__about">
                  <div className="story-win__name">{hero.name}</div>
                  <div className="story-win__text">{hero.bio}</div>
                </div>
              </div>
            </div>
          )}

          {title && <h2 className="story-win__heading">{title}</h2>}

          <div className="story-win__dante">
            <BlockRenderer content={content} />
          </div>
        </div>
      </div>
    </div>
  )
}
