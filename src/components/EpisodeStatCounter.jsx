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
 */

const START_DELAY = 550
const TICK_MS = 250
const MAX_DURATION_MS = 3000

export default function EpisodeStatCounter({ alive, dead }) {
  const [displayed, setDisplayed] = useState({ alive, dead })
  const firstRunRef = useRef(true)
  const prevRef = useRef({ alive, dead })

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false
      prevRef.current = { alive, dead }
      setDisplayed({ alive, dead }) // eslint-disable-line react-hooks/set-state-in-effect
      return
    }

    const from = prevRef.current
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
        const val = { alive: nextAlive, dead: nextDead }
        prevRef.current = val
        setDisplayed(val)
      }, START_DELAY + i * tick))
    }

    return () => timeouts.forEach(clearTimeout)
  }, [alive, dead])

  return (
    <div className="ep-counter">
      <div className="ep-cell">
        <span className="ep-cell__label">alive</span>
        <span className="ep-cell__value ep-cell__value--alive" key={`a-${displayed.alive}`}>{displayed.alive}</span>
      </div>
      <div className="ep-cell">
        <span className="ep-cell__label">dead</span>
        <span className="ep-cell__value ep-cell__value--dead" key={`d-${displayed.dead}`}>{displayed.dead}</span>
      </div>
    </div>
  )
}
