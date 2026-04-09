import characters from '../data/characters.json'
import BlockRenderer from './BlockRenderer'
import '../styles/StoryWindow.css'

export default function AllStoriesWindowInner({ stories, path, title, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="story-win" onClick={handleOverlayClick}>
      <div className="story-win__inner">
        <button className="story-win__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14 1.41L12.59 0 7 5.59 1.41 0 0 1.41 5.59 7 0 12.59 1.41 14 7 8.41 12.59 14 14 12.59 8.41 7z"
              fill="#333"
            />
          </svg>
        </button>

        <div className="story-win__wrap-all">
          {title && <h2 className="story-win__heading" style={{ padding: '24px 24px 0' }}>{title}</h2>}

          {stories && stories.map((story, idx) => {
            const hero = characters.find((c) => c.id === story.heroId)
            return (
              <div key={story.heroId || idx} className="story-win__content-wrap--all">
                {hero && (
                  <div className={`story-win__header${idx > 0 ? ' story-win__header--all' : ''}`}>
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
                <div className="story-win__dante">
                  <BlockRenderer content={story} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
