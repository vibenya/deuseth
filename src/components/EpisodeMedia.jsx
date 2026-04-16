import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import EpisodeStatCounter from './EpisodeStatCounter'
import EpisodeBlockchain from './EpisodeBlockchain'
import Tokenville from './Tokenville'
import TeamChat from './TeamChat'

/**
 * Normalize the structured media object into a flat list of slide items
 * so the rest of the component can treat them uniformly.
 *
 * media object shapes (from episode JSON):
 *   { type: 'video',      src, cover, subtitles?, statsUnlockAt? }
 *   { type: 'gallery',    slides: [url, ...], cover }
 *   { type: 'image',      src }
 *   { type: 'tokenville', teamChat: {...} }
 *   { type: 'teamchat',   teamChat: {...} }
 *   { type: 'youtube',    id, cover }
 *   { type: 'coub',       id, cover }
 */
function mediaToItems(media) {
  if (!media) return []
  if (media.type === 'gallery') {
    return media.slides.map(src => ({ type: 'image', src }))
  }
  // video, image, tokenville, youtube, coub → single item
  // normalise 'cover' field to 'preview' for internal use
  const item = { ...media }
  if (item.cover) { item.preview = item.cover; delete item.cover }
  return [item]
}

export default function EpisodeMedia({
  episodeId,
  title,
  media,
  episodeNav,
  onOpenDrawer,
  onTimeUpdate,
  onSlideChange,
  aliveCount,
  deadCount,
  keyboardEnabled = true,
  showStats = true,
  blockchain,
  showStarted = true,
  onStart,
}) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const [chainOpen, setChainOpen] = useState(false)
  const chainRef = useRef(null)
  const items = useMemo(() => mediaToItems(media), [media])
  const subtitles = media?.subtitles ?? []

  const [displayed, setDisplayed] = useState(() => items[0] ?? null)
  const [fadeOut, setFadeOut] = useState(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const iframeRef = useRef(null)
  // Track Tokenville's internal scene for skip button
  const [tvScene, setTvScene] = useState(media?.video ? 'video' : 'chat')
  const tvSkipRef = useRef(null)

  // Close chain overlay on outside click
  useEffect(() => {
    if (!chainOpen) return
    function onClick(e) {
      if (chainRef.current && !chainRef.current.contains(e.target)) setChainOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [chainOpen])

  // Close chain overlay on episode change
  useEffect(() => { setChainOpen(false) }, [episodeId])

  useEffect(() => {
    setMediaIndex(0)
    setVideoEnded(false)
    setTvScene(media?.video ? 'video' : 'chat')
    onSlideChange?.(0)
  // onSlideChange is always a stable React setter (setCurrentSlide) — safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId])

  useEffect(() => {
    const ci = items[mediaIndex]
    if (!ci) return

    // Types with no src (e.g. tokenville) — swap immediately
    if (ci.type === 'tokenville' || ci.type === 'teamchat') {
      setDisplayed(ci)
      return
    }

    const newSrc = ci.type === 'image' ? ci.src : (ci.type === 'video' ? ci.src : ci.preview)
    if (!newSrc) return

    const currentSrc = displayed
      ? (displayed.type === 'image' ? displayed.src : displayed.type === 'video' ? displayed.src : displayed.preview)
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

  const goToSlide = useCallback((idx) => {
    setMediaIndex(idx)
    onSlideChange?.(idx)
  }, [onSlideChange])

  useEffect(() => {
    if (!keyboardEnabled) return
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        const next = Math.min(items.length - 1, mediaIndex + 1)
        if (next !== mediaIndex) goToSlide(next)
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const prev = Math.max(0, mediaIndex - 1)
        if (prev !== mediaIndex) goToSlide(prev)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [items.length, mediaIndex, keyboardEnabled, goToSlide])

  const isTokenville = displayed?.type === 'tokenville'
  const isTeamChat = displayed?.type === 'teamchat'
  const isVideo = displayed && (displayed.type === 'youtube' || displayed.type === 'coub')
  const isLocalVideo = displayed?.type === 'video'
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
      } catch { /* ignore malformed postMessage data */ }
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
    } catch { /* ignore cross-origin errors */ }
  }, [])

  const videoSrc = displayed
    ? displayed.type === 'youtube'
      ? `https://www.youtube.com/embed/${displayed.id}?autoplay=1&rel=0&enablejsapi=1`
      : `https://coub.com/embed/${displayed.id}?muted=false&autostart=true&originalSize=false&startWithHD=true`
    : null

  const hasNext = episodeNav?.nextEpisode && !episodeNav.nextEpisode.disabled
  const isLastSlide = mediaIndex === items.length - 1
  const isMultiSlide = !isVideo && !isLocalVideo && !isTokenville && !isTeamChat && items.length > 1

  // Single unified advance: slide → next slide, video playing → skip to cover, last slide/cover/coub → next episode
  const canSkipVideo = ((isVideo && !isCoub) || isLocalVideo) && !videoEnded
  const canSkipTokenville = (isTokenville && (tvScene === 'video' || tvScene === 'chat'))
  const canAdvanceSlide = isMultiSlide && !isLastSlide
  const canAdvanceEp = hasNext && !canAdvanceSlide && !canSkipVideo && !canSkipTokenville

  function handleAdvance() {
    if (canSkipVideo) { setVideoEnded(true); onTimeUpdate?.(null) }
    else if (canSkipTokenville) tvSkipRef.current?.()
    else if (canAdvanceSlide) goToSlide(mediaIndex + 1)
    else if (canAdvanceEp) episodeNav.onNext()
  }

  const advanceDisabled = !canSkipVideo && !canAdvanceSlide && !canAdvanceEp && !canSkipTokenville
  const advanceLabel = (canSkipVideo || canSkipTokenville) ? 'Skip' : 'Next'

  if (!showStarted) {
    return (
      <div className="ep-player__media-block">
        <div className="ep-player__media">
          <div className="ep-player__media-inner">
            <img className="ep-player__img" src="/images/share.jpg" alt="DEUS ETH" />
          </div>
        </div>
        <div className="ep-player__media-overlay">
          <button
            type="button"
            className="ep-ctrl__title-block ep-cell"
            onClick={onOpenDrawer}
            title="All episodes"
          >
            <span className="ep-cell__label">2018-2026</span>
            <h2 className="ep-cell__value">A Retrospective Exhibition</h2>
          </button>
          <div className="ep-ctrl__right">
            <div className="ep-ctrl__epnav">
              <button
                type="button"
                className="ep-ctrl__advance ep-ctrl__advance--active ep-ctrl__advance--start"
                onClick={onStart}
              >
                <span className="ep-ctrl__advance-content">
                  <span className="ep-ctrl__advance-label">Start</span>
                </span>
                <span className="ep-ctrl__advance-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ep-player__media-block">
      <div className={`ep-player__media${isTokenville || isTeamChat ? ' ep-player__media--tokenville' : ''}`}>
        {displayed && (
          <div className="ep-player__media-inner">
            {isTokenville && <Tokenville embedded onSlideChange={onSlideChange} teamChat={media.teamChat} video={media.video} onSceneChange={setTvScene} skipRef={tvSkipRef} />}
            {isTeamChat && <TeamChat script={media.teamChat?.script} senderColors={media.teamChat?.senderColors ?? {}} header={media.teamChat?.header} embedded onSlideChange={onSlideChange} />}
            {displayed.type === 'image' && (
              <img className="ep-player__img" src={displayed.src} alt="" />
            )}
            {isLocalVideo && !videoEnded && (
              <video
                key={`${episodeId}-${mediaIndex}`}
                className="ep-player__iframe"
                src={displayed.src}
                autoPlay
                playsInline
                controls
                onEnded={() => { setVideoEnded(true); onTimeUpdate?.(null) }}
                onTimeUpdate={(e) => onTimeUpdate?.(e.target.currentTime)}
              >
                {subtitles?.map(({ lang, label, src }) => (
                  <track key={lang} kind="subtitles" src={src} srcLang={lang} label={label} default={lang === 'en'} />
                ))}
              </video>
            )}
            {isLocalVideo && videoEnded && displayed.preview && (
              <img
                className="ep-player__img ep-player__video-cover"
                src={displayed.preview}
                alt=""
              />
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

            {/* Carousel overlay: only prev arrow */}
            {isMultiSlide && (
              <div className="ep-media__carousel-nav">
                <button
                  type="button"
                  className="ep-media__carousel-btn ep-media__carousel-btn--prev"
                  onClick={() => goToSlide(Math.max(0, mediaIndex - 1))}
                  disabled={mediaIndex === 0}
                  aria-label="Previous slide"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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

        {/* On-chain proof overlay — inside media container */}
        {chainOpen && blockchain && (
          <div className="ep-chain-overlay">
            <EpisodeBlockchain blockchain={blockchain} />
          </div>
        )}
      </div>

      {/* Title + controls */}
      <div className="ep-player__media-overlay">
        {/* Left: title block — click opens episode drawer */}
        <button
          type="button"
          className="ep-ctrl__title-block ep-cell"
          onClick={onOpenDrawer}
          title="All episodes"
        >
          <span className="ep-cell__label">
            {episodeId === 0
              ? 'Prologue'
              : `Episode ${episodeNav?.current}`}
            {episodeNav && episodeId !== 0 && <span className="ep-ctrl__title-total"> of {episodeNav.total - 1}</span>}
            <svg className="ep-ctrl__title-chevron" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <h2 className="ep-cell__value">{title}</h2>
        </button>

        {/* Right: stats + prev + advance */}
        <div className="ep-ctrl__right">
          {showStats && (
            <div className="ep-ctrl__stats-wrap" ref={chainRef}>
              <button
                type="button"
                className={`ep-ctrl__stats-btn${chainOpen ? ' is-active' : ''}${blockchain ? '' : ' ep-ctrl__stats-btn--static'}`}
                onClick={() => blockchain && setChainOpen(v => !v)}
              >
                <EpisodeStatCounter alive={aliveCount} dead={deadCount} />
              </button>
            </div>
          )}

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

            <button
              type="button"
              className={`ep-ctrl__advance${advanceDisabled ? ' ep-ctrl__advance--disabled' : canAdvanceSlide ? ' ep-ctrl__advance--slide' : advanceLabel === 'Skip' ? ' ep-ctrl__advance--skip' : ' ep-ctrl__advance--active'}`}
              onClick={handleAdvance}
              disabled={advanceDisabled}
              title={canAdvanceSlide ? `Slide ${mediaIndex + 2} of ${items.length}` : episodeNav?.nextEpisode ? `Next: ${episodeNav.nextEpisode.title}` : ''}
              aria-label={canAdvanceSlide ? 'Next slide' : 'Next episode'}
            >
              <span className="ep-ctrl__advance-content">
                {canAdvanceSlide ? (
                  <span className="ep-ctrl__advance-dots" aria-hidden="true">
                    {items.map((_, i) => (
                      <span key={i} className={'ep-ctrl__advance-dot' + (i === mediaIndex ? ' is-active' : '')} />
                    ))}
                  </span>
                ) : (
                  <span className="ep-ctrl__advance-label">{advanceLabel}</span>
                )}
              </span>
              {/* Arrow: episode nav = ▶| (mirror of prev), slide nav = filled chevron */}
              <span className="ep-ctrl__advance-arrow" aria-hidden="true">
                {canAdvanceSlide ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 6l10 6-10 6z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.5 12L6 6v12zm1.5-6h2v12h-2z"/>
                  </svg>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
