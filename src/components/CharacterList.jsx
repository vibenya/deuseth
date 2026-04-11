/*
 * CHARACTER STATUS STATE MACHINE
 * ================================
 *
 * Statuses (per episode):
 *   alive     — character is alive at this point in the story
 *   died-now  — character dies in the current episode
 *   dead      — character died in a previous episode
 *   reborn    — character was resurrected in the current episode
 *
 * Transitions when navigating between episodes:
 *   alive    → died-now   shot animation plays on the card (clistBloodSplash on skull div)
 *   died-now → dead       CSS transition on img (filter + opacity), no remount
 *   dead     → dead       no visual change (same key, same styles)
 *   dead     → alive      CSS transition on img back to filter:none opacity:1
 *   * → reborn            golden pulse overlay appears
 *
 * Video-sync events (videoEvents prop):
 *   Each event: { time: number, characterId: number, event: 'died-now'|'reborn'|'highlight' }
 *   - Characters with a died-now or reborn videoEvent are suppressed from the episode-level
 *     animation until their video timestamp fires — keeping them "alive/dead" until the scene.
 *   - highlight: brief glow, fades after HIGHLIGHT_DURATION_MS.
 *   - died-now: triggers shot animation at that video moment.
 *   - reborn: triggers revive animation at that video moment.
 *
 * Key decisions:
 *   - Cards use key={c.id} — NEVER remounted on episode change.
 *   - displayEpisodeId is delayed by 550ms after currentEpisodeId changes.
 *   - died-now cards get --shot-delay CSS var staggered by 0.25s per character.
 *
 * CSS files:
 *   CharacterList.css — all card styles and keyframes
 */

// ─── Video-sync config ────────────────────────────────────────────────────
const HIGHLIGHT_DURATION_MS = 3000   // how long the highlight glow lasts
const VIDEO_DEATH_SETTLE_MS  = 3200  // ms after died-now trigger before settling to dead style
// ─────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from 'react'
import characters from '../data/characters.json'
import CharacterModal from './CharacterModal'
import '../styles/CharacterList.css'

export const mainCast = characters.filter(c => c.collection === 'original' && c.id >= 1 && c.id <= 50)

export function computeStatuses(episodes, currentEpisodeId) {
  const deadBefore = new Set()
  const diedThisEpisode = new Set()
  const reborn = new Set()

  const currentIdx = episodes.findIndex(ep => ep.id === currentEpisodeId)
  if (currentIdx < 0) return { deadBefore, diedThisEpisode, reborn }

  for (let i = 0; i < currentIdx; i++) {
    const ep = episodes[i]
    if (ep.reborn && ep.rip) {
      deadBefore.clear()
    } else if (ep.rip) {
      ep.rip.forEach(id => { if (id > 0) deadBefore.add(id) })
    }
  }

  const current = episodes[currentIdx]
  if (current.reborn && current.rip) {
    current.rip.forEach(id => { if (id > 0) reborn.add(id) })
    deadBefore.clear()
  } else if (current.rip) {
    current.rip.forEach(id => {
      if (id > 0 && !deadBefore.has(id)) {
        diedThisEpisode.add(id)
      }
    })
  }

  return { deadBefore, diedThisEpisode, reborn }
}

export function getStatus(id, deadBefore, diedThisEpisode, reborn) {
  if (reborn.has(id)) return 'reborn'
  if (diedThisEpisode.has(id)) return 'died-now'
  if (deadBefore.has(id)) return 'dead'
  return 'alive'
}

function buildDiedNowOrder(diedThisEpisode) {
  const map = new Map()
  let i = 0
  for (const id of diedThisEpisode) map.set(id, i++)
  return map
}

function getRebornDelay(id) {
  // pseudo-random but stable per character id
  return ((id * 137 + 31) % 17) * 0.1
}

export default function CharacterList({
  currentEpisodeId,
  episodes,
  onCharacterClick,
  videoEvents,
  currentVideoTime,
}) {
  const [selectedChar, setSelectedChar] = useState(null)
  const [displayEpisodeId, setDisplayEpisodeId] = useState(currentEpisodeId)
  const [diedNowSettled, setDiedNowSettled] = useState(false)
  const t2Ref = useRef(null)

  // ── Video-sync state ──────────────────────────────────────────────────────
  const [videoHighlighted, setVideoHighlighted]       = useState(() => new Set())
  const [videoTriggeredDeaths, setVideoTriggeredDeaths] = useState(() => new Set())
  const [videoDeathSettled, setVideoDeathSettled]     = useState(() => new Set())
  const [videoTriggeredReborns, setVideoTriggeredReborns] = useState(() => new Set())
  const firedRef         = useRef(new Set())   // event keys already fired
  const highlightTimers  = useRef(new Map())   // characterId → timer
  const deathSettleTimers = useRef(new Map())  // characterId → timer

  // Reset all video state when episode changes
  useEffect(() => {
    firedRef.current = new Set()
    highlightTimers.current.forEach(clearTimeout)
    highlightTimers.current.clear()
    deathSettleTimers.current.forEach(clearTimeout)
    deathSettleTimers.current.clear()
    setVideoHighlighted(new Set())
    setVideoTriggeredDeaths(new Set())
    setVideoDeathSettled(new Set())
    setVideoTriggeredReborns(new Set())
  }, [currentEpisodeId])

  // Process video time updates
  useEffect(() => {
    if (!videoEvents?.length || currentVideoTime == null) return

    for (const evt of videoEvents) {
      if (currentVideoTime < evt.time) continue
      const key = `${evt.time}-${evt.characterId}-${evt.event}`
      if (firedRef.current.has(key)) continue
      firedRef.current.add(key)

      if (evt.event === 'highlight') {
        setVideoHighlighted(prev => new Set([...prev, evt.characterId]))
        const timer = setTimeout(() => {
          setVideoHighlighted(prev => { const s = new Set(prev); s.delete(evt.characterId); return s })
        }, HIGHLIGHT_DURATION_MS)
        highlightTimers.current.set(key, timer)

      } else if (evt.event === 'died-now') {
        setVideoTriggeredDeaths(prev => new Set([...prev, evt.characterId]))
        const timer = setTimeout(() => {
          setVideoDeathSettled(prev => new Set([...prev, evt.characterId]))
        }, VIDEO_DEATH_SETTLE_MS)
        deathSettleTimers.current.set(key, timer)

      } else if (evt.event === 'reborn') {
        setVideoTriggeredReborns(prev => new Set([...prev, evt.characterId]))
      }
    }
  }, [currentVideoTime, videoEvents])

  // IDs whose death/reborn is video-controlled (suppressed until timestamp fires)
  const videoControlledDeaths = useMemo(() => {
    if (!videoEvents?.length) return new Set()
    return new Set(videoEvents.filter(e => e.event === 'died-now').map(e => e.characterId))
  }, [videoEvents])

  const videoControlledReborns = useMemo(() => {
    if (!videoEvents?.length) return new Set()
    return new Set(videoEvents.filter(e => e.event === 'reborn').map(e => e.characterId))
  }, [videoEvents])

  // ── Episode-level animation (unchanged logic) ─────────────────────────────
  useEffect(() => {
    const eps = episodes || []
    const t1 = setTimeout(() => {
      setDisplayEpisodeId(currentEpisodeId)
      setDiedNowSettled(false)

      const { diedThisEpisode } = computeStatuses(eps, currentEpisodeId)
      // exclude video-controlled deaths — they'll animate at their timestamp
      const episodeLevelDeaths = [...diedThisEpisode].filter(id => !videoControlledDeaths.has(id))
      const maxShotDelay = Math.max(0, episodeLevelDeaths.length - 1) * 250
      const settledIn = maxShotDelay + 2200 + 1000

      t2Ref.current = setTimeout(() => setDiedNowSettled(true), settledIn)
    }, 550)

    return () => { clearTimeout(t1); clearTimeout(t2Ref.current) }
  // videoControlledDeaths intentionally excluded — stable across episode lifetime
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpisodeId, episodes])

  const { deadBefore, diedThisEpisode, reborn } = useMemo(
    () => computeStatuses(episodes || [], displayEpisodeId),
    [episodes, displayEpisodeId]
  )

  const baseStatusOf = (id) => getStatus(id, deadBefore, diedThisEpisode, reborn)

  // Effective status: video-triggered overrides episode-level
  const statusOf = (id) => {
    if (videoTriggeredReborns.has(id)) return 'reborn'
    if (videoTriggeredDeaths.has(id))  return 'died-now'
    const base = baseStatusOf(id)
    // Suppress episode-level animation for video-controlled chars not yet triggered
    if (videoControlledDeaths.has(id)  && base === 'died-now') return 'alive'
    if (videoControlledReborns.has(id) && base === 'reborn')   return 'dead'
    return base
  }

  const diedNowOrder = useMemo(() => buildDiedNowOrder(diedThisEpisode), [diedThisEpisode])

  const handleClick = (c) => {
    if (onCharacterClick) onCharacterClick(c)
    setSelectedChar(c)
  }

  const renderChar = (c) => {
    const status = statusOf(c.id)
    const isVideoTriggerDeath = videoTriggeredDeaths.has(c.id)
    const isHighlighted = videoHighlighted.has(c.id)

    // Shot delay: staggered for episode-level deaths, instant for video-triggered
    const shotDelay = status === 'died-now'
      ? isVideoTriggerDeath ? 0 : (diedNowOrder.get(c.id) ?? 0) * 0.25
      : 0

    const rebornDelay = status === 'reborn' ? getRebornDelay(c.id) : 0

    const isSettled = status === 'died-now' && (
      isVideoTriggerDeath ? videoDeathSettled.has(c.id) : diedNowSettled
    )

    const style = {
      ...(status === 'died-now' && { '--shot-delay': `${shotDelay}s` }),
      ...(status === 'reborn'   && { '--reborn-delay': `${rebornDelay}s` }),
    }

    return (
      <div
        key={c.id}
        className={
          'clist__char' +
          ` clist__char--${status}` +
          (isSettled       ? ' clist__char--died-settled' : '') +
          (isHighlighted   ? ' clist__char--highlight'    : '') +
          ((c.saleCount ?? 0) === 0 ? ' clist__char--unclaimed' : '')
        }
        style={style}
        onClick={() => handleClick(c)}
        title={(c.saleCount ?? 0) === 0 ? 'Never resold on secondary market' : c.name}
      >
        {(status === 'died-now' || status === 'dead') && (
          <div className={`clist__skull${status === 'dead' ? ' clist__skull--faded' : ''}`} />
        )}
        {status === 'reborn' && <div className="clist__reborn-flash" />}
        {isHighlighted && <div className="clist__highlight-glow" />}
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
