import { useState, useEffect } from 'react'
import CharacterList from './CharacterList'
import EpisodeMedia from './EpisodeMedia'
import EpisodeList from './EpisodeList'
import ProjectFacts from './ProjectFacts'
import { useCharacterStatuses } from '../hooks/useCharacterStatuses'
import '../styles/Episode.css'
import '../styles/Rip.css'

export default function Episode({
  episode,
  episodes,
  onOpenDrawer,
  episodeNav,
  topbarSlot,
  activeId,
  onChangeEpisode,
  showStarted,
  onStart,
  onVideoEnd,
}) {
  const [charModalOpen, setCharModalOpen] = useState(false)
  const [currentVideoTime, setCurrentVideoTime] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const { statusOf, getDyingMeta, aliveCount, deadCount } = useCharacterStatuses({
    episode,
    episodes: episodes ?? [],
    currentVideoTime,
    currentSlide,
  })

  const isPrologue = episode?.type === 'intro'

  const [statsUnlocked, setStatsUnlocked] = useState(!isPrologue)
  useEffect(() => { setStatsUnlocked(!isPrologue) }, [episode?.id, isPrologue]) // eslint-disable-line react-hooks/set-state-in-effect
  useEffect(() => {
    const unlockAt = episode?.media?.statsUnlockAt
    if (!statsUnlocked && unlockAt != null && currentVideoTime != null && currentVideoTime >= unlockAt) {
      setStatsUnlocked(true) // eslint-disable-line react-hooks/set-state-in-effect -- unlock triggered by video time
    }
  }, [currentVideoTime, statsUnlocked, episode?.media?.statsUnlockAt])

  /* eslint-disable react-hooks/set-state-in-effect -- intentional reset on episode change */
  useEffect(() => {
    setCurrentVideoTime(null)
    setCurrentSlide(0)
  }, [episode?.id])
  /* eslint-enable react-hooks/set-state-in-effect */

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
          onVideoEnd={onVideoEnd}
          aliveCount={aliveCount}
          deadCount={deadCount}
          keyboardEnabled={!charModalOpen}
          showStats={statsUnlocked}
          blockchain={episode.blockchain}
          showStarted={showStarted}
          onStart={onStart}
        />

        {episodes?.length > 0 && onChangeEpisode && (
          <>
            <EpisodeList episodes={episodes} activeId={activeId} onChangeEpisode={onChangeEpisode} />
            <ProjectFacts />
          </>
        )}
      </div>

      {/* Right column: characters */}
      <div className={`ep-player__right${!showStarted ? ' ep-player__right--hidden' : ''}`}>
        {episodes?.length > 0 && (
          <CharacterList
            episode={episode}
            statusOf={statusOf}
            getDyingMeta={getDyingMeta}
            onModalOpenChange={setCharModalOpen}
            currentVideoTime={currentVideoTime}
            currentSlide={currentSlide}
          />
        )}
      </div>
      </div>
    </div>
  )
}
