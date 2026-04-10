import { useState, useEffect, useMemo } from 'react'
import EpisodeStatCounter from './EpisodeStatCounter'

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
  deadCount,
  keyboardEnabled = true,
}) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const items = useMemo(() => media ? media.map(parseMedia) : [], [media])

  // `displayed` is the item currently painted on screen — decoupled from
  // items[mediaIndex] so we can preload the next image and swap only when
  // it's fully decoded (no collapsed/empty frame between slides or episodes).
  const [displayed, setDisplayed] = useState(() => (media ? parseMedia(media[0]) : null))
  const [fadeOut, setFadeOut] = useState(null)

  useEffect(() => {
    setMediaIndex(0)
  }, [episodeId])

  useEffect(() => {
    const ci = items[mediaIndex]
    if (!ci) return
    const newSrc = ci.type === 'image' ? ci.src : ci.preview
    if (!newSrc) return

    const currentSrc = displayed
      ? (displayed.type === 'image' ? displayed.src : displayed.preview)
      : null
    if (currentSrc === newSrc) return

    if (!displayed) {
      setDisplayed(ci)
      return
    }

    let cancelled = false
    const preload = new Image()
    const finish = () => {
      if (cancelled) return
      setFadeOut({ src: currentSrc, id: Date.now() + Math.random() })
      setDisplayed(ci)
    }
    preload.onload = finish
    preload.onerror = finish
    preload.src = newSrc
    // If the image is already cached, some browsers set complete=true synchronously.
    if (preload.complete && preload.naturalWidth > 0) finish()

    return () => { cancelled = true }
  // `displayed` intentionally omitted — adding it would re-trigger after setDisplayed, causing an infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, mediaIndex, items])

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

  const isVideo = displayed && (displayed.type === 'youtube' || displayed.type === 'coub')
  const handlePlay = () => {
    if (!displayed) return
    if (displayed.type === 'youtube') onOpenVideo?.(displayed.id)
    else if (displayed.type === 'coub') onOpenVideo?.({ coub: displayed.id })
  }

  return (
    <div className="ep-player__media-block">
      <div className="ep-player__media">
        {displayed && (
          <div className="ep-player__media-inner">
            {displayed.type === 'image' && (
              <img className="ep-player__img" src={displayed.src} alt="" />
            )}
            {isVideo && (
              <div className="ep-player__video-preview" onClick={handlePlay}>
                <img src={displayed.preview} alt="" />
              </div>
            )}
          </div>
        )}
        {fadeOut && (
          <img
            key={fadeOut.id}
            className="ep-player__fadeout"
            src={fadeOut.src}
            alt=""
            onAnimationEnd={() => setFadeOut(null)}
          />
        )}
      </div>

      {/* Title + player-style controls — acts as main nav */}
      <div className="ep-player__media-overlay">
        {/* Title block — left */}
        <div className="ep-ctrl__title-block">
          <span className="ep-player__number">{episodeId === 0 ? 'Prologue' : number}</span>
          <h2 className="ep-player__title">{title}</h2>
        </div>

        {/* Middle — content controls: play (video) or gallery dots */}
        <div className="ep-ctrl__gallery">
          {isVideo && (
            <button
              type="button"
              className="ep-ctrl__play"
              onClick={handlePlay}
              aria-label="Play media"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
              <span>Play media</span>
            </button>
          )}
          {!isVideo && items.length > 1 && (
            <div className="ep-ctrl__gallery-nav">
              <button
                type="button"
                className="ep-ctrl__gnav ep-ctrl__gnav--prev"
                onClick={() => setMediaIndex(i => Math.max(0, i - 1))}
                disabled={mediaIndex === 0}
                aria-label="Previous slide"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
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
              <button
                type="button"
                className="ep-ctrl__gnav ep-ctrl__gnav--next"
                onClick={() => setMediaIndex(i => Math.min(items.length - 1, i + 1))}
                disabled={mediaIndex === items.length - 1}
                aria-label="Next slide"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right — stats + episode navigation */}
        <div className="ep-ctrl__right">
          <EpisodeStatCounter alive={aliveCount} dead={deadCount} />

          <div className="ep-ctrl__epnav">
            <button
              type="button"
              className="ep-ctrl__nav ep-ctrl__nav--prev"
              onClick={episodeNav?.onPrev}
              disabled={!episodeNav?.prevEpisode}
              title={episodeNav?.prevEpisode ? `Previous: ${episodeNav.prevEpisode.title}` : ''}
              aria-label="Previous episode"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6h2v12H6V6zm3.5 6L18 6v12l-8.5-6z" fill="currentColor"/>
              </svg>
            </button>

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

            <button
              type="button"
              className="ep-ctrl__nav ep-ctrl__nav--next"
              onClick={episodeNav?.onNext}
              disabled={!episodeNav?.nextEpisode || episodeNav.nextEpisode.disabled}
              title={episodeNav?.nextEpisode && !episodeNav.nextEpisode.disabled ? `Next: ${episodeNav.nextEpisode.title}` : ''}
              aria-label="Next episode"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 6l8.5 6L6 18V6zm10 0h2v12h-2V6z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
