import { useState, useEffect } from 'react'

function parseMedia(str) {
  const parts = str.split(':')
  if (parts[0] === 'youtube') return { type: 'youtube', id: parts[1], preview: parts.slice(2).join(':') }
  if (parts[0] === 'coub') return { type: 'coub', id: parts[1], preview: parts.slice(2).join(':') }
  if (parts[0] === 'image') return { type: 'image', src: parts.slice(1).join(':') }
  return { type: 'image', src: str }
}

export default function EpisodeMedia({
  episodeId,
  number,
  title,
  media,
  episodeNav,
  onOpenDrawer,
  onOpenVideo,
  aliveCount,
  diedNowCount = 0,
  rebornCount = 0,
  keyboardEnabled = true,
}) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const items = media ? media.map(parseMedia) : []

  useEffect(() => {
    setMediaIndex(0)
  }, [episodeId])

  useEffect(() => {
    if (!keyboardEnabled) return
    function onKey(e) {
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
  }, [items.length, keyboardEnabled])

  const currentItem = items[mediaIndex]

  return (
    <div className="ep-player__media-block">
      <div className="ep-player__media">
        {currentItem && (
          <div className="ep-player__media-inner" key={mediaIndex}>
            {currentItem.type === 'image' && (
              <img className="ep-player__img" src={currentItem.src} alt="" />
            )}
            {currentItem.type === 'youtube' && (
              <div className="ep-player__video-preview" onClick={() => onOpenVideo?.(currentItem.id)}>
                <img src={currentItem.preview} alt="" />
                <div className="ep-player__play-icon">&#9654;</div>
              </div>
            )}
            {currentItem.type === 'coub' && (
              <div className="ep-player__video-preview" onClick={() => onOpenVideo?.({ coub: currentItem.id })}>
                <img src={currentItem.preview} alt="" />
                <div className="ep-player__play-icon">&#9654;</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title + player-style controls */}
      <div className="ep-player__media-overlay">
        {/* Prev episode */}
        <button
          type="button"
          className="ep-ctrl__nav ep-ctrl__nav--prev"
          onClick={episodeNav?.onPrev}
          disabled={!episodeNav?.prevEpisode}
          title={episodeNav?.prevEpisode ? `Previous: ${episodeNav.prevEpisode.title}` : ''}
          aria-label="Previous episode"
        />

        {/* Title block */}
        <div className="ep-ctrl__title-block">
          {episodeId !== 0 && <span className="ep-player__number">{number}</span>}
          <h2 className="ep-player__title">{title}</h2>
        </div>

        {/* Stats + dots + progress — middle cluster */}
        <div className="ep-ctrl__meta">
          <div className="ep-ctrl__stat ep-ctrl__stat--alive">
            <span className="ep-ctrl__stat-num">{aliveCount}</span>
            <span className="ep-ctrl__stat-label">alive</span>
          </div>

          {(diedNowCount > 0 || rebornCount > 0) && (
            <div className={'ep-ctrl__stat ep-ctrl__stat--rip' + (rebornCount > 0 ? ' is-reborn' : '')}>
              <span className="ep-ctrl__stat-num">
                {rebornCount > 0 ? `+${rebornCount}` : `−${diedNowCount}`}
              </span>
              <span className="ep-ctrl__stat-label">
                {rebornCount > 0 ? 'reborn' : 'rip'}
              </span>
            </div>
          )}

          {items.length > 1 && (
            <div className="ep-ctrl__dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={'ep-ctrl__dot' + (i === mediaIndex ? ' is-active' : '')}
                  onClick={() => setMediaIndex(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {episodeNav && (
            <button
              type="button"
              className="ep-ctrl__progress"
              onClick={onOpenDrawer}
              title="All episodes"
            >
              {episodeNav.current}<span className="ep-ctrl__progress-sep">/</span>{episodeNav.total - 1}
            </button>
          )}
        </div>

        {/* Next episode */}
        <button
          type="button"
          className="ep-ctrl__nav ep-ctrl__nav--next"
          onClick={episodeNav?.onNext}
          disabled={!episodeNav?.nextEpisode || episodeNav.nextEpisode.disabled}
          title={episodeNav?.nextEpisode && !episodeNav.nextEpisode.disabled ? `Next: ${episodeNav.nextEpisode.title}` : ''}
          aria-label="Next episode"
        />
      </div>
    </div>
  )
}
