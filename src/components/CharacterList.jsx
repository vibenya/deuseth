/*
 * CHARACTER LIST
 * ==============
 * Renders a 5×10 grid of character cards.
 * Status computation is delegated to useCharacterStatuses hook.
 *
 * Visual states:
 *   alive          — normal card
 *   dying          — blood splash animation playing (alive→dead transition)
 *   dying-settled  — animation done, card fades to grayscale
 *   dead           — fully grayscale + skull
 *   reviving       — golden strobe animation (dead→alive transition)
 *
 * Media-sync effects (visual only, no state change):
 *   highlight      — brief glow on character card
 *   winner         — trophy overlay
 *
 * Cards use key={c.id} — never remounted across episode changes.
 * A 550ms delay on displayEpisodeId lets the media crossfade settle
 * before episode-level death animations start.
 */

const HIGHLIGHT_DURATION_MS = 3000

import { useState, useMemo, useEffect, useRef } from 'react'
import characters from '../data/characters.json'
import CharacterModal from './CharacterModal'
import { useCharacterStatuses } from '../hooks/useCharacterStatuses'
import { createPlayer } from '../utils/createPlayer'
import '../styles/CharacterList.css'

export const mainCast = characters.filter(c => c.collection === 'original' && c.id >= 1 && c.id <= 50)

function getRebornDelay(id) {
  return ((id * 137 + 31) % 17) * 0.1
}

export default function CharacterList({
  episode,
  episodes,
  onCharacterClick,
  currentVideoTime,
  currentSlide,
  draftIds,
}) {
  const deathPlayerRef  = useRef(null)
  const rebornPlayerRef = useRef(null)
  const winnerPlayerRef = useRef(null)
  if (!deathPlayerRef.current)  deathPlayerRef.current  = createPlayer('/sounds/buzzer.wav', 0.08)
  if (!rebornPlayerRef.current) rebornPlayerRef.current = createPlayer('/sounds/reborn.wav', 0.25, { debounce: 1000 })
  if (!winnerPlayerRef.current) winnerPlayerRef.current = createPlayer('/sounds/winner.wav', 0.6)
  const playDeath  = (d) => deathPlayerRef.current.play(d)
  const playReborn = ()  => rebornPlayerRef.current.play()
  const playWinner = ()  => winnerPlayerRef.current.play()

  const [selectedChar, setSelectedChar] = useState(null)

  // Delay episode display by 550ms so media crossfade settles first
  const [displayEpisodeId, setDisplayEpisodeId] = useState(episode?.id)
  useEffect(() => {
    const t = setTimeout(() => setDisplayEpisodeId(episode?.id), 550)
    return () => clearTimeout(t)
  }, [episode?.id])

  // Use the episode for the delayed display epoch (for animations)
  const displayEpisode = episodes?.find(ep => ep.id === displayEpisodeId) ?? episode

  const { statusOf, getDyingMeta } = useCharacterStatuses({
    episode: displayEpisode,
    episodes: episodes ?? [],
    currentVideoTime,
    currentSlide,
  })

  // Reset sound players on episode change
  useEffect(() => {
    deathPlayerRef.current.cancel()
    rebornPlayerRef.current.cancel()
    winnerPlayerRef.current.cancel()
  }, [episode?.id])

  // ── Highlight state (video + slide) ──────────────────────────────────────
  const [highlighted, setHighlighted] = useState(() => new Set())
  const highlightTimers = useRef(new Map())

  // Slide highlights: active only while on exact slide (derived)
  const slideHighlighted = useMemo(() => {
    const slideEvents = episode?.events?.filter(e => e.action === 'highlight' && e.at?.slide != null) ?? []
    if (!slideEvents.length || currentSlide == null) return new Set()
    return new Set(
      slideEvents
        .filter(e => e.at.slide === currentSlide)
        .flatMap(e => e.characters === 'all' ? mainCast.map(c => c.id) : e.characters)
    )
  }, [episode?.events, currentSlide])

  // Video highlights: fire once, fade after HIGHLIGHT_DURATION_MS
  const videoHighlightEventsRef = useRef([])
  const firedHighlightsRef = useRef(new Set())

  useEffect(() => {
    videoHighlightEventsRef.current = episode?.events?.filter(
      e => e.action === 'highlight' && e.at?.videoTime != null
    ) ?? []
    firedHighlightsRef.current = new Set()
    highlightTimers.current.forEach(clearTimeout)
    highlightTimers.current.clear()
    setHighlighted(new Set())
  }, [episode?.id])

  useEffect(() => {
    if (currentVideoTime == null) return
    for (const evt of videoHighlightEventsRef.current) {
      if (currentVideoTime < evt.at.videoTime) continue
      const ids = evt.characters === 'all' ? mainCast.map(c => c.id) : evt.characters
      for (const id of ids) {
        const key = `${evt.at.videoTime}-${id}`
        if (firedHighlightsRef.current.has(key)) continue
        firedHighlightsRef.current.add(key)
        setHighlighted(prev => new Set(prev).add(id))
        const t = setTimeout(() => {
          setHighlighted(prev => { const s = new Set(prev); s.delete(id); return s })
          highlightTimers.current.delete(key)
        }, HIGHLIGHT_DURATION_MS)
        highlightTimers.current.set(key, t)
      }
    }
  }, [currentVideoTime])

  // ── Winner state (slide-triggered) ───────────────────────────────────────
  const [winners, setWinners] = useState(() => new Set())
  const firedWinnersRef = useRef(new Set())

  useEffect(() => {
    firedWinnersRef.current = new Set()
    setWinners(new Set())
  }, [episode?.id])

  useEffect(() => {
    if (currentSlide == null) return
    const winnerEvents = episode?.events?.filter(e => e.action === 'winner' && e.at?.slide != null) ?? []
    for (const evt of winnerEvents) {
      if (currentSlide < evt.at.slide) continue
      const ids = evt.characters === 'all' ? mainCast.map(c => c.id) : evt.characters
      for (const id of ids) {
        const key = `${evt.at.slide}-${id}`
        if (firedWinnersRef.current.has(key)) continue
        firedWinnersRef.current.add(key)
        playWinner()
        setWinners(prev => new Set(prev).add(id))
      }
    }
  }, [currentSlide, episode?.events])

  // ── Render ────────────────────────────────────────────────────────────────

  const handleClick = (c) => {
    if (onCharacterClick) onCharacterClick(c)
    setSelectedChar(c)
  }

  const renderChar = (c) => {
    const status = statusOf(c.id)
    const meta = getDyingMeta(c.id)
    const isHighlighted = highlighted.has(c.id) || slideHighlighted.has(c.id)

    // Shot delay: staggered for episode-level deaths, instant for media-triggered
    const shotDelay = meta && !meta.isVideoTriggered && !meta.isSlideTriggered
      ? meta.episodeLevelIndex * 0.25
      : 0

    const rebornDelay = status === 'reviving' ? getRebornDelay(c.id) : 0

    // Map internal status to CSS class
    const cssStatus = status === 'dying' ? 'died-now'
      : status === 'dying-settled' ? 'dead'
      : status === 'reviving' ? 'reborn'
      : status  // 'alive' | 'dead'

    const style = {
      ...(status === 'dying'   && { '--shot-delay':   `${shotDelay}s` }),
      ...(status === 'reviving' && { '--reborn-delay': `${rebornDelay}s` }),
    }

    return (
      <div
        key={c.id}
        className={
          'clist__char' +
          ` clist__char--${cssStatus}` +
          (status === 'dying-settled'  ? ' clist__char--died-settled' : '') +
          (isHighlighted               ? ' clist__char--highlight'    : '') +
          ((c.saleCount ?? 0) === 0   ? ' clist__char--unclaimed'    : '') +
          (draftIds?.includes(c.id)   ? ' clist__char--draft'        : '')
        }
        style={style}
        onClick={() => handleClick(c)}
        title={(c.saleCount ?? 0) === 0 ? 'Never resold on secondary market' : c.name}
      >
        {(status === 'dying' || status === 'dying-settled' || status === 'dead') && (
          <div
            className={`clist__skull${status === 'dead' || status === 'dying-settled' ? ' clist__skull--faded' : ''}`}
            onAnimationStart={(e) => {
              if (e.animationName === 'clistBloodSplash' && status === 'dying') playDeath(1320)
            }}
          />
        )}
        {status === 'reviving' && <div className="clist__reborn-flash" onAnimationStart={() => playReborn()} />}
        {isHighlighted && <div className="clist__highlight-glow" />}
        {winners.has(c.id) && <div className="clist__trophy">🏆</div>}
        {draftIds?.includes(c.id) && <div className="clist__owned-star">★</div>}
        <img src={c.preview} alt={c.name} className="clist__char-img" />
      </div>
    )
  }

  return (
    <div className="clist">
      <div className="clist__grid">
        {mainCast.map((c) => renderChar(c))}
      </div>

      {selectedChar && (
        <CharacterModal
          character={selectedChar}
          status={statusOf(selectedChar.id)}
          onClose={() => setSelectedChar(null)}
        />
      )}
    </div>
  )
}
