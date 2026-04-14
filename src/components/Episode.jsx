import { useState, useEffect, useMemo } from 'react'
import CharacterList, { computeStatuses, mainCast } from './CharacterList'
import EpisodeMedia from './EpisodeMedia'
import characters from '../data/characters.json'
import '../styles/Episode.css'
import '../styles/Rip.css'

const obitModules = import.meta.glob('../data/obits/*.json', { eager: true })

function getObits(path) {
  const key = Object.keys(obitModules).find(k => k.includes(`/${path}`))
  return key ? obitModules[key].default || obitModules[key] : null
}

// Content comes from our own trusted JSON files (src/data/), not user input.
// dangerouslySetInnerHTML is safe here — renders <span class="mention"> in episode text.

export default function Episode({
  episodeId, number, title, text, media, rip, path,
  comment, storyHeroIds, onOpenDrawer, episodeNav, episodes, videoEvents, slideEvents, draftIds
}) {
  const [activeObit, setActiveObit] = useState(null)
  const [currentVideoTime, setCurrentVideoTime] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const obits = getObits(`${path}.json`)

  const { deadBefore, diedThisEpisode, reborn } = useMemo(
    () => computeStatuses(episodes || [], episodeId),
    [episodes, episodeId]
  )
  // On reborn episodes (Hard Fork) computeStatuses already clears deadBefore
  // when it populates `reborn`, so we must NOT add reborn.size — doing so
  // double-counts and overflows past mainCast.length.
  const aliveCount = mainCast.length - deadBefore.size - diedThisEpisode.size
  const deadCount = mainCast.length - aliveCount

  const isReborn = episodeId === 8

  useEffect(() => {
    setActiveObit(null)
    setCurrentVideoTime(null)
    setCurrentSlide(0)
  }, [episodeId])

  function openObit(c) {
    const id = typeof c === 'object' ? c.id : c
    if (obits && obits[id]) setActiveObit(id)
  }

  const activeObitData = activeObit !== null && obits ? obits[activeObit] : null
  const activeChar = activeObit !== null
    ? characters.find(c => c.id === activeObit)
    : null

  return (
    <div className="ep-player">
      <div className="ep-player__body">
      {/* Left column: media + text */}
      <div className="ep-player__left">
        <EpisodeMedia
          episodeId={episodeId}
          number={number}
          title={title}
          media={media}
          episodeNav={episodeNav}
          onOpenDrawer={onOpenDrawer}
          onTimeUpdate={setCurrentVideoTime}
          onSlideChange={setCurrentSlide}
          aliveCount={aliveCount}
          deadCount={deadCount}
          keyboardEnabled={activeObit === null}
        />

      </div>

      {/* Right column: characters */}
      <div className="ep-player__right">
        {episodes && episodes.length > 0 && (
          <CharacterList
            currentEpisodeId={episodeId}
            episodes={episodes}
            onCharacterClick={openObit}
            videoEvents={videoEvents}
            currentVideoTime={currentVideoTime}
            slideEvents={slideEvents}
            currentSlide={currentSlide}
            draftIds={draftIds}
          />
        )}
      </div>
      </div>{/* end ep-player__body */}

      {/* Obit modal — trusted content from local JSON */}
      {activeObitData && activeChar && (
        <div className="modal" onClick={() => setActiveObit(null)}>
          <div className="modal__content" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setActiveObit(null)}>
              <svg viewBox="0 0 20 20" fill="#fff"><path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"/></svg>
            </button>
            <h3>{activeChar.name} &mdash; {isReborn ? 'Revived' : 'Obituary'}</h3>
            <div dangerouslySetInnerHTML={{ __html: activeObitData.text || activeObitData }} />
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
