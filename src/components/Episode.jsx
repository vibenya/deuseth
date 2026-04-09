import { useState, useEffect, useCallback } from 'react'
import YouTubeModal from './YouTubeModal'
import CharacterList from './CharacterList'
import characters from '../data/characters.json'
import '../styles/Episode.css'
import '../styles/Rip.css'

const obitModules = import.meta.glob('../data/obits/*.json', { eager: true })

function getObits(path) {
  const key = Object.keys(obitModules).find(k => k.includes(`/${path}`))
  return key ? obitModules[key].default || obitModules[key] : null
}

function parseMedia(str) {
  const parts = str.split(':')
  if (parts[0] === 'youtube') return { type: 'youtube', id: parts[1], preview: parts.slice(2).join(':') }
  if (parts[0] === 'coub') return { type: 'coub', id: parts[1], preview: parts.slice(2).join(':') }
  if (parts[0] === 'image') return { type: 'image', src: parts.slice(1).join(':') }
  return { type: 'image', src: str }
}

// Content comes from our own trusted JSON files (src/data/), not user input.
// dangerouslySetInnerHTML is safe here — renders <span class="mention"> in episode text.

export default function Episode({
  episodeId, number, title, text, media, rip, path,
  comment, storyHeroIds, onOpenDrawer, episodeNav, episodes
}) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const [librettoExpanded, setLibrettoExpanded] = useState(false)
  const [commentExpanded, setCommentExpanded] = useState(false)
  const [activeObit, setActiveObit] = useState(null)
  const [videoModal, setVideoModal] = useState(null)

  const obits = getObits(`${path}.json`)
  const items = media ? media.map(parseMedia) : []

  const ripCharacters = rip
    ? rip.map(id => characters.find(c => c.id === id)).filter(Boolean)
    : []

  const isReborn = episodeId === 8

  useEffect(() => {
    setMediaIndex(0)
    setLibrettoExpanded(false)
    setCommentExpanded(false)
    setActiveObit(null)
  }, [episodeId])

  useEffect(() => {
    function onKey(e) {
      if (activeObit !== null || videoModal) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setMediaIndex(prev => prev < items.length - 1 ? prev + 1 : prev)
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setMediaIndex(prev => prev > 0 ? prev - 1 : prev)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [items.length, activeObit, videoModal])

  const goMedia = useCallback((dir) => {
    setMediaIndex(prev => {
      const next = prev + dir
      if (next < 0 || next >= items.length) return prev
      return next
    })
  }, [items.length])

  function openObit(id) {
    if (obits && obits[id]) setActiveObit(id)
  }

  const currentItem = items[mediaIndex]
  const activeObitData = activeObit !== null && obits ? obits[activeObit] : null
  const activeChar = activeObit !== null
    ? characters.find(c => c.id === activeObit)
    : null

  return (
    <div className="ep-player">
      {/* Media block */}
      <div className="ep-player__media-block">
        <div className="ep-player__media">
          {currentItem && (
            <div className="ep-player__media-inner" key={mediaIndex}>
              {currentItem.type === 'image' && (
                <img className="ep-player__img" src={currentItem.src} alt="" />
              )}
              {currentItem.type === 'youtube' && (
                <div className="ep-player__video-preview" onClick={() => setVideoModal(currentItem.id)}>
                  <img src={currentItem.preview} alt="" />
                  <div className="ep-player__play-icon">&#9654;</div>
                </div>
              )}
              {currentItem.type === 'coub' && (
                <div className="ep-player__video-preview" onClick={() => setVideoModal({ coub: currentItem.id })}>
                  <img src={currentItem.preview} alt="" />
                  <div className="ep-player__play-icon">&#9654;</div>
                </div>
              )}
            </div>
          )}

          {items.length > 1 && mediaIndex > 0 && (
            <button className="ep-player__arrow ep-player__arrow--left" onClick={() => goMedia(-1)} />
          )}
          {items.length > 1 && mediaIndex < items.length - 1 && (
            <button className="ep-player__arrow ep-player__arrow--right" onClick={() => goMedia(1)} />
          )}
        </div>

        {/* Media controls: dots */}
        {items.length > 1 && (
          <div className="ep-player__dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={'ep-player__dot' + (i === mediaIndex ? ' ep-player__dot--active' : '')}
                onClick={() => setMediaIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info area below media */}
      <div className="ep-player__info">
        {/* Episode title */}
        <div className="ep-player__title-row">
          <h2 className="ep-player__title">
            <span className="ep-player__number">{number}</span> {title}
          </h2>
        </div>

        {/* Libretto — inline, 2 lines collapsed */}
        {text && text.length > 0 && (
          <div
            className={'ep-player__section' + (librettoExpanded ? ' ep-player__section--open' : '')}
            onClick={() => setLibrettoExpanded(v => !v)}
          >
            <div className="ep-player__section-label">Libretto</div>
            {/* trusted content from local JSON */}
            <div className="ep-player__section-text">
              {text.map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
              ))}
            </div>
          </div>
        )}

        {/* Director's note — inline, 2 lines collapsed */}
        {comment && (
          <div
            className={'ep-player__section' + (commentExpanded ? ' ep-player__section--open' : '')}
            onClick={() => setCommentExpanded(v => !v)}
          >
            <div className="ep-player__section-label">Director's Note</div>
            <div className="ep-player__section-text">{comment}</div>
          </div>
        )}

        {/* All 50 characters — elimination board */}
        {episodes && episodes.length > 0 && (
          <CharacterList
            currentEpisodeId={episodeId}
            episodes={episodes}
            onCharacterClick={openObit}
          />
        )}
      </div>

      {/* Bottom episode navigation */}
      {episodeNav && (
        <div className="ep-nav">
          {/* Previous episode */}
          <button
            className="ep-nav__side ep-nav__side--prev"
            onClick={episodeNav.onPrev}
            disabled={!episodeNav.prevEpisode}
          >
            {episodeNav.prevEpisode ? (
              <>
                <span className="ep-nav__arrow ep-nav__arrow--left" />
                <span className="ep-nav__side-meta">
                  <span className="ep-nav__side-label">Previous</span>
                  <span className="ep-nav__side-title">{episodeNav.prevEpisode.title}</span>
                </span>
              </>
            ) : <span />}
          </button>

          {/* Center — progress + all episodes */}
          <button className="ep-nav__center" onClick={onOpenDrawer}>
            <span className="ep-nav__progress-ring">
              <svg viewBox="0 0 36 36" className="ep-nav__ring-svg">
                <circle className="ep-nav__ring-bg" cx="18" cy="18" r="15.5" />
                <circle
                  className="ep-nav__ring-fill"
                  cx="18" cy="18" r="15.5"
                  strokeDasharray={`${((episodeNav.current + 1) / episodeNav.total) * 97.4} 97.4`}
                />
              </svg>
              <span className="ep-nav__progress-text">
                {episodeNav.current + 1}<span className="ep-nav__progress-sep">/</span>{episodeNav.total}
              </span>
            </span>
            <span className="ep-nav__center-label">All Episodes</span>
          </button>

          {/* Next episode */}
          <button
            className="ep-nav__side ep-nav__side--next"
            onClick={episodeNav.onNext}
            disabled={!episodeNav.nextEpisode || episodeNav.nextEpisode.disabled}
          >
            {episodeNav.nextEpisode && !episodeNav.nextEpisode.disabled ? (
              <>
                <span className="ep-nav__side-meta">
                  <span className="ep-nav__side-label">Next</span>
                  <span className="ep-nav__side-title">{episodeNav.nextEpisode.title}</span>
                </span>
                <span className="ep-nav__arrow ep-nav__arrow--right" />
              </>
            ) : (
              <span className="ep-nav__side-meta">
                <span className="ep-nav__side-label ep-nav__side-label--dim">Finale</span>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Obit modal — trusted content from local JSON */}
      {activeObitData && activeChar && (
        <div className="modal" onClick={() => setActiveObit(null)}>
          <div className="modal__content" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setActiveObit(null)}>
              <svg viewBox="0 0 20 20" fill="#fff"><path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"/></svg>
            </button>
            <h3>{activeChar.name} &mdash; {isReborn ? 'Revived' : 'Obituary'}</h3>
            <div dangerouslySetInnerHTML={{ __html: activeObitData.text || activeObitData }} />
          </div>
        </div>
      )}

      {videoModal && typeof videoModal === 'string' && (
        <YouTubeModal youtubeId={videoModal} onClose={() => setVideoModal(null)} />
      )}
      {videoModal && videoModal.coub && (
        <YouTubeModal coubId={videoModal.coub} onClose={() => setVideoModal(null)} />
      )}
    </div>
  )
}
