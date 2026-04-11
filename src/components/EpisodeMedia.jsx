import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
  onTimeUpdate,
  aliveCount,
  deadCount,
  keyboardEnabled = true,
}) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const items = useMemo(() => media ? media.map(parseMedia) : [], [media])

  const [displayed, setDisplayed] = useState(() => (media ? parseMedia(media[0]) : null))
  const [fadeOut, setFadeOut] = useState(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const iframeRef = useRef(null)

  useEffect(() => {
    setMediaIndex(0)
    setVideoEnded(false)
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
    if (preload.complete && preload.naturalWidth > 0) finish()

    return () => { cancelled = true }
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
  const isCoub = displayed?.type === 'coub'

  // YouTube end detection + time updates via postMessage.
  // YouTube only sends events after we send a 'listening' message first (done in handleIframeLoad).
  useEffect(() => {
    if (!isVideo || isCoub) return
    function onMessage(e) {
      try {
        const data = JSON.parse(e.data)
        if (data.event === 'onStateChange' && data.info === 0) {
          setVideoEnded(true)
        }
        if (data.event === 'infoDelivery' && data.info?.currentTime != null) {
          onTimeUpdate?.(data.info.currentTime)
        }
      } catch {}
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [isVideo, isCoub, episodeId, onTimeUpdate])

  const handleIframeLoad = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 'ep-player', channel: 'widget' }),
        '*'
      )
    } catch {}
  }, [])

  const videoSrc = displayed
    ? displayed.type === 'youtube'
      ? `https://www.youtube.com/embed/${displayed.id}?autoplay=1&rel=0&enablejsapi=1`
      : `https://coub.com/embed/${displayed.id}?muted=false&autostart=true&originalSize=false&startWithHD=true`
    : null

  const hasNext = episodeNav?.nextEpisode && !episodeNav.nextEpisode.disabled
  const isLastSlide = mediaIndex === items.length - 1
  // Coub loops forever — show next right away; YouTube — after ended
  const showNextEpBtn = hasNext && (isVideo ? (isCoub || videoEnded) : isLastSlide)

  return (
    <div className="ep-player__media-block">
      <div className="ep-player__media">
        {displayed && (
          <div className="ep-player__media-inner">
            {displayed.type === 'image' && (
              <img className="ep-player__img" src={displayed.src} alt="" />
            )}
            {isVideo && !videoEnded && (
              <iframe
                key={`${episodeId}-${mediaIndex}`}
                ref={iframeRef}
                className="ep-player__iframe"
                src={videoSrc}
                allow="autoplay; encrypted-media"
                allowFullScreen
                onLoad={handleIframeLoad}
              />
            )}
            {isVideo && videoEnded && (
              <img
                className="ep-player__img ep-player__video-cover"
                src={displayed.preview}
                alt=""
              />
            )}

            {/* Carousel nav overlay — only for multi-image episodes */}
            {!isVideo && items.length > 1 && (
              <div className="ep-media__carousel-nav">
                <button
                  type="button"
                  className="ep-media__carousel-btn ep-media__carousel-btn--prev"
                  onClick={() => setMediaIndex(i => Math.max(0, i - 1))}
                  disabled={mediaIndex === 0}
                  aria-label="Previous slide"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="ep-media__carousel-dots">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={'ep-media__carousel-dot' + (i === mediaIndex ? ' is-active' : '')}
                      onClick={() => setMediaIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="ep-media__carousel-btn ep-media__carousel-btn--next"
                  onClick={() => setMediaIndex(i => Math.min(items.length - 1, i + 1))}
                  disabled={mediaIndex === items.length - 1}
                  aria-label="Next slide"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
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

      {/* Title + player-style controls */}
      <div className="ep-player__media-overlay">
        {/* Left: title block */}
        <div className="ep-ctrl__title-block">
          <span className="ep-player__number">{episodeId === 0 ? 'Prologue' : number}</span>
          <h2 className="ep-player__title">{title}</h2>
        </div>

        {/* Center: next episode button (appears on video end or last slide) */}
        <div className="ep-ctrl__gallery">
          {showNextEpBtn && (
            <button
              type="button"
              className="ep-ctrl__next-ep"
              onClick={episodeNav.onNext}
            >
              <span>Next Episode</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Right: stats + episode navigation */}
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
