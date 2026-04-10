import { useEffect, useRef, useState } from 'react'

/*
 * EpisodeStatCounter
 * ------------------
 * Renders the `alive` / `dead` pair on the episode control bar and
 * animates changes tick-by-tick when the episode switches.
 *
 * Timing is tuned to roughly match the character death stagger in
 * CharacterList.jsx:
 *   - 550 ms start delay  (matches displayEpisodeId delay — lets the
 *                          media crossfade settle before numbers move)
 *   - 250 ms per tick      (matches the per-character shot stagger)
 *   - capped at ~3 s total so episodes with many deaths (or the
 *     reborn hard-fork) don't crawl forever.
 *
 * Uses a ref as the source of truth for displayed values plus a
 * forced re-render on each tick, so effect cleanup can cancel
 * in-flight animations cleanly when the user navigates quickly.
 */

const START_DELAY = 550
const TICK_MS = 250
const MAX_DURATION_MS = 3000

export default function EpisodeStatCounter({ alive, dead }) {
  const [, forceRender] = useState(0)
  const displayedRef = useRef({ alive, dead })
  const firstRunRef = useRef(true)

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false
      displayedRef.current = { alive, dead }
      return
    }

    const from = displayedRef.current
    if (from.alive === alive && from.dead === dead) return

    const steps = Math.max(
      Math.abs(alive - from.alive),
      Math.abs(dead - from.dead),
    )
    if (steps === 0) return

    const tick = Math.max(40, Math.min(TICK_MS, Math.floor(MAX_DURATION_MS / steps)))

    const timeouts = []
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps
      const nextAlive = Math.round(from.alive + (alive - from.alive) * progress)
      const nextDead  = Math.round(from.dead  + (dead  - from.dead ) * progress)
      timeouts.push(setTimeout(() => {
        displayedRef.current = { alive: nextAlive, dead: nextDead }
        forceRender(x => x + 1)
      }, START_DELAY + i * tick))
    }

    return () => timeouts.forEach(clearTimeout)
  }, [alive, dead])

  const { alive: dispAlive, dead: dispDead } = displayedRef.current

  return (
    <div className="ep-counter">
      <div className="ep-counter__item ep-counter__item--alive">
        <span className="ep-counter__label">alive</span>
        <span className="ep-counter__num" key={`a-${dispAlive}`}>{dispAlive}</span>
      </div>
      <div className="ep-counter__item ep-counter__item--dead">
        <span className="ep-counter__label">dead</span>
        <span className="ep-counter__num" key={`d-${dispDead}`}>{dispDead}</span>
      </div>
    </div>
  )
}
