/**
 * useCharacterStatuses — single source of truth for character alive/dead state.
 *
 * State machine:
 *   alive  ──die──→  dying  ──(after DEATH_SETTLE_MS)──→  dead
 *   dead   ──revive──→  reviving  ──(brief)──→  alive
 *
 * Event sources (from episode.events array):
 *   - Episode-level events (no `at` field): apply when episode loads.
 *   - Video-synced events (`at.videoTime`): apply when currentVideoTime >= threshold.
 *   - Slide-synced events (`at.slide`): apply when currentSlide >= threshold.
 *
 * Backward scrubbing: recomputes from scratch on every time update.
 * No firedRef / no stale state.
 */

import { useState, useEffect, useRef, useMemo } from 'react'

const DEATH_SETTLE_MS = 3200  // ms after transition before settling to 'dead' style

const allCharIds = Array.from({ length: 50 }, (_, i) => i + 1)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveCharacters(characters) {
  return characters === 'all' ? allCharIds : characters
}

/**
 * Apply all events from a completed (past) episode to the dead set.
 * Assumes all events have fired (episode is fully in the past).
 */
function applyPastEpisode(deadSet, episode) {
  if (episode.type === 'prologue') {
    // Prologue starts with all 50 dead
    allCharIds.forEach(id => deadSet.add(id))
  }
  for (const evt of episode.events ?? []) {
    const ids = resolveCharacters(evt.characters)
    if (evt.action === 'die') {
      ids.forEach(id => deadSet.add(id))
    } else if (evt.action === 'revive') {
      if (evt.characters === 'all') deadSet.clear()
      else ids.forEach(id => deadSet.delete(id))
    }
    // highlight / winner: visual only, no state change
  }
}

/**
 * Compute which characters are dead at the start of `targetEpisodeId`
 * (before any events of that episode have fired).
 */
function computeDeadBefore(episodes, targetEpisodeId) {
  const dead = new Set()
  for (const ep of episodes) {
    if (ep.id === targetEpisodeId) break
    applyPastEpisode(dead, ep)
  }
  return dead
}

/**
 * Compute die/revive events that have fired in the current episode
 * given the current video time and slide index.
 */
function computeCurrentEpisodeFiredEvents(episode, videoTime, slide) {
  if (!episode) return { died: new Set(), revived: new Set() }

  const died = new Set()
  const revived = new Set()

  if (episode.type === 'prologue') {
    // All start dead — handled by deadBefore logic via computeDeadBefore
  }

  for (const evt of episode.events ?? []) {
    if (evt.action !== 'die' && evt.action !== 'revive') continue

    const shouldFire = !evt.at ||
      (evt.at.videoTime != null && videoTime != null && videoTime >= evt.at.videoTime) ||
      (evt.at.slide     != null && slide     != null && slide     >= evt.at.slide)

    if (!shouldFire) continue

    const ids = resolveCharacters(evt.characters)
    if (evt.action === 'die') ids.forEach(id => died.add(id))
    else if (evt.action === 'revive') {
      if (evt.characters === 'all') { revived.clear(); allCharIds.forEach(id => revived.add(id)) }
      else ids.forEach(id => revived.add(id))
    }
  }

  return { died, revived }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {object}   opts.episode          - current episode (new format with events[])
 * @param {object[]} opts.episodes         - all episodes (for history)
 * @param {number|null} opts.currentVideoTime
 * @param {number|null} opts.currentSlide
 *
 * @returns {{ statusOf, aliveCount, deadCount, getDyingMeta }}
 *   statusOf(id) → 'alive' | 'dead' | 'dying' | 'dying-settled' | 'reviving'
 *   aliveCount   → number (real-time)
 *   deadCount    → number (real-time)
 *   getDyingMeta(id) → { isVideoTriggered, isSlideTriggered, episodeLevelIndex } | null
 */
export function useCharacterStatuses({ episode, episodes, currentVideoTime, currentSlide }) {
  // Dead set from all episodes before this one (stable per episode)
  const deadBefore = useMemo(
    () => computeDeadBefore(episodes ?? [], episode?.id ?? -1),
    [episodes, episode?.id]
  )

  // Pre-computed sets for episode-level (no `at`) events — stable per episode
  const episodeLevelDied = useMemo(() => {
    const s = new Set()
    if (!episode) return s
    for (const evt of episode.events ?? []) {
      if (evt.at || evt.action !== 'die') continue
      resolveCharacters(evt.characters).forEach(id => s.add(id))
    }
    return s
  }, [episode])

  const episodeLevelRevived = useMemo(() => {
    const s = new Set()
    if (!episode) return s
    for (const evt of episode.events ?? []) {
      if (evt.at || evt.action !== 'revive') continue
      if (evt.characters === 'all') return new Set(allCharIds)
      resolveCharacters(evt.characters).forEach(id => s.add(id))
    }
    return s
  }, [episode])

  // Map of id → order index for episode-level deaths (for shot-delay stagger)
  const episodeLevelDyingOrder = useMemo(() => {
    const map = new Map()
    let i = 0
    for (const id of episodeLevelDied) map.set(id, i++)
    return map
  }, [episodeLevelDied])

  // IDs that have video-synced die events (for zero-delay override)
  const videoSyncedDieIds = useMemo(() => {
    const s = new Set()
    if (!episode) return s
    for (const evt of episode.events ?? []) {
      if (evt.action === 'die' && evt.at?.videoTime != null) {
        resolveCharacters(evt.characters).forEach(id => s.add(id))
      }
    }
    return s
  }, [episode])

  // IDs that have slide-synced die events
  const slideSyncedDieIds = useMemo(() => {
    const s = new Set()
    if (!episode) return s
    for (const evt of episode.events ?? []) {
      if (evt.action === 'die' && evt.at?.slide != null) {
        resolveCharacters(evt.characters).forEach(id => s.add(id))
      }
    }
    return s
  }, [episode])

  // ── Current episode: which events have fired at this moment? ──────────────
  // When video ends it reports null — treat that as "very far into the future"
  // so all previously-fired events stay fired (no resetting deaths on video end).
  const lastKnownVideoTime = useRef(null)
  useEffect(() => {
    if (currentVideoTime != null) lastKnownVideoTime.current = currentVideoTime
  }, [currentVideoTime])
  // Reset when episode changes
  useEffect(() => { lastKnownVideoTime.current = null }, [episode?.id])

  const effectiveVideoTime = currentVideoTime ?? lastKnownVideoTime.current

  const { died: firedDied, revived: firedRevived } = useMemo(
    () => computeCurrentEpisodeFiredEvents(episode, effectiveVideoTime, currentSlide),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [episode, effectiveVideoTime, currentSlide]
  )

  // ── Settle timers: dying → dying-settled ──────────────────────────────────
  const [settledIds, setSettledIds] = useState(() => new Set())
  const settleTimers = useRef(new Map())  // id → timerId

  // Reset on episode change
  useEffect(() => {
    settleTimers.current.forEach(clearTimeout)
    settleTimers.current.clear()
    setSettledIds(new Set())
  }, [episode?.id])

  // Start settle timer for each new dying character
  useEffect(() => {
    for (const id of firedDied) {
      // Episode-level deaths get a stagger delay added to their settle time
      const stagger = episodeLevelDied.has(id) && !videoSyncedDieIds.has(id) && !slideSyncedDieIds.has(id)
        ? (episodeLevelDyingOrder.get(id) ?? 0) * 250
        : 0

      if (!settleTimers.current.has(id)) {
        const t = setTimeout(() => {
          setSettledIds(prev => new Set(prev).add(id))
        }, DEATH_SETTLE_MS + stagger)
        settleTimers.current.set(id, t)
      }
    }
    // Clean up settled ids that are no longer dying (backward scrub past the death)
    for (const id of settleTimers.current.keys()) {
      if (!firedDied.has(id)) {
        clearTimeout(settleTimers.current.get(id))
        settleTimers.current.delete(id)
        setSettledIds(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firedDied])

  // ── Status computation ────────────────────────────────────────────────────

  const statusOf = (id) => {
    const wasDead = deadBefore.has(id)

    // Prologue: all chars start dead; they only come alive when the revive event fires
    if (episode?.type === 'prologue') {
      return firedRevived.has(id) ? 'reviving' : 'dead'
    }

    if (episodeLevelRevived.has(id)) return wasDead ? 'reviving' : 'alive'

    // Media-synced revive has fired (e.g. video revive event)
    if (firedRevived.has(id)) return 'reviving'

    if (firedDied.has(id)) {
      return settledIds.has(id) ? 'dying-settled' : 'dying'
    }

    // Suppress episode-level animation for media-synced deaths not yet triggered
    if ((videoSyncedDieIds.has(id) || slideSyncedDieIds.has(id)) && episodeLevelDied.has(id)) {
      return wasDead ? 'dead' : 'alive'
    }

    if (wasDead) return 'dead'
    return 'alive'
  }

  // ── Counts ────────────────────────────────────────────────────────────────

  const { aliveCount, deadCount } = useMemo(() => {
    let dead = 0
    for (const id of allCharIds) {
      const s = statusOf(id)
      if (s === 'dead' || s === 'dying' || s === 'dying-settled') dead++
    }
    return { aliveCount: allCharIds.length - dead, deadCount: dead }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadBefore, firedDied, firedRevived, settledIds, episodeLevelRevived, episode?.id])

  // ── Dying metadata (for CharacterList animation staggering) ───────────────

  const getDyingMeta = (id) => {
    if (!firedDied.has(id)) return null
    return {
      isVideoTriggered: videoSyncedDieIds.has(id),
      isSlideTriggered: slideSyncedDieIds.has(id),
      episodeLevelIndex: episodeLevelDyingOrder.get(id) ?? 0,
    }
  }

  return { statusOf, aliveCount, deadCount, getDyingMeta }
}
