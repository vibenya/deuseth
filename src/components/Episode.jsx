import { useState, useEffect } from 'react'
import CharacterList from './CharacterList'
import EpisodeMedia from './EpisodeMedia'
import EpisodeFacts from './EpisodeFacts'
import { useCharacterStatuses } from '../hooks/useCharacterStatuses'
import characters from '../data/characters.json'
import '../styles/Episode.css'
import '../styles/Rip.css'

// story[] paragraphs may contain <span class="mention"> tags from our own JSON files.
// This is safe: content is authored by us, not user-generated.

export default function Episode({
  episode,
  episodes,
  draftIds,
  onOpenDrawer,
  episodeNav,
  topbarSlot,
  activeId,
  onChangeEpisode,
}) {
  const [activeObit, setActiveObit] = useState(null)
  const [currentVideoTime, setCurrentVideoTime] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const { aliveCount, deadCount } = useCharacterStatuses({
    episode,
    episodes: episodes ?? [],
    currentVideoTime,
    currentSlide,
  })

  const isPrologue = episode?.type === 'prologue'
  const isReborn   = episode?.events?.some(e => e.action === 'revive' && !e.at) ?? false

  const [statsUnlocked, setStatsUnlocked] = useState(!isPrologue)
  useEffect(() => { setStatsUnlocked(!isPrologue) }, [episode?.id])
  useEffect(() => {
    const unlockAt = episode?.media?.statsUnlockAt
    if (!statsUnlocked && unlockAt != null && currentVideoTime != null && currentVideoTime >= unlockAt) {
      setStatsUnlocked(true)
    }
  }, [currentVideoTime, statsUnlocked, episode?.media?.statsUnlockAt])

  useEffect(() => {
    setActiveObit(null)
    setCurrentVideoTime(null)
    setCurrentSlide(0)
  }, [episode?.id])

  function openObit(c) {
    const id = typeof c === 'object' ? c.id : c
    if (episode?.obits?.[id]) setActiveObit(id)
  }

  const activeObitData = activeObit !== null ? episode?.obits?.[activeObit] : null
  const activeChar = activeObit !== null ? characters.find(c => c.id === activeObit) : null

  if (!episode) return null

  return (
    <div className="ep-player">
      <div className="ep-player__body">
      {/* Left column: media + text */}
      <div className="ep-player__left">
        {topbarSlot}
        <EpisodeMedia
          episodeId={episode.id}
          number={episode.number}
          title={episode.title}
          media={episode.media}
          episodeNav={episodeNav}
          onOpenDrawer={onOpenDrawer}
          onTimeUpdate={setCurrentVideoTime}
          onSlideChange={setCurrentSlide}
          aliveCount={aliveCount}
          deadCount={deadCount}
          keyboardEnabled={activeObit === null}
          showStats={statsUnlocked}
        />

        {episodes?.length > 0 && onChangeEpisode && (
          <>
            <div className="ep-player__episode-list">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className={
                    'ep-ep-item' +
                    (ep.id === activeId ? ' ep-ep-item--active' : '') +
                    (ep.disabled ? ' ep-ep-item--disabled' : '')
                  }
                  onClick={() => !ep.disabled && onChangeEpisode(ep.id)}
                >
                  <img src={ep.art?.slide} alt={ep.title} />
                </div>
              ))}
            </div>
            <EpisodeFacts />
          </>
        )}
      </div>

      {/* Right column: characters */}
      <div className="ep-player__right">
        {episodes?.length > 0 && (
          <CharacterList
            episode={episode}
            episodes={episodes}
            onCharacterClick={openObit}
            currentVideoTime={currentVideoTime}
            currentSlide={currentSlide}
            draftIds={draftIds}
          />
        )}
      </div>
      </div>

      {/* Obit modal — plain text content from local JSON */}
      {activeObitData && activeChar && (
        <div className="modal" onClick={() => setActiveObit(null)}>
          <div className="modal__content" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setActiveObit(null)}>
              <svg viewBox="0 0 20 20" fill="#fff"><path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"/></svg>
            </button>
            <h3>{activeChar.name} &mdash; {isReborn ? 'Revived' : 'Obituary'}</h3>
            {activeObitData.image && (
              <img src={activeObitData.image} alt={activeChar.name} className="ep-player__obit-img" />
            )}
            <p>{activeObitData.text}</p>
            <div className="ep-player__obit-token-info">
              Token #{activeChar.id} — {activeChar.lastSalePrice != null
                ? `Last sold for Ξ ${activeChar.lastSalePrice}`
                : 'Never claimed'}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
