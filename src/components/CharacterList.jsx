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
 *   alive    → died-now   shot animation plays on the card (clistBgDie + clistShotGlow on img)
 *   died-now → dead       CSS transition on img (filter + opacity), no remount
 *   dead     → dead       no visual change (same key, same styles)
 *   dead     → alive      CSS transition on img back to filter:none opacity:1
 *   * → reborn            golden pulse overlay appears
 *
 * Key decisions:
 *   - Cards use key={c.id} — they are NEVER remounted on episode change.
 *     Status changes are expressed through className only, so CSS transitions
 *     on .clist__char-img (filter 0.5s, opacity 0.5s) handle all smooth fades.
 *   - displayEpisodeId is delayed by 550ms after currentEpisodeId changes so
 *     the episode media and background crossfade settle before characters update.
 *   - died-now cards get --shot-delay CSS var staggered by 0.25s per character
 *     (order in diedThisEpisode set), driving the clistBgDie + clistShotGlow animations.
 *   - The shot animation final state (grayscale 0.9, brightness 0.5, opacity 0.6)
 *     exactly matches the static .clist__char--dead img styles so the transition
 *     from died-now → dead is visually seamless.
 *
 * CSS files:
 *   CharacterList.css — all card styles and keyframes
 */

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

export default function CharacterList({ currentEpisodeId, episodes, onCharacterClick }) {
  const [selectedChar, setSelectedChar] = useState(null)
  const [displayEpisodeId, setDisplayEpisodeId] = useState(currentEpisodeId)
  const [diedNowSettled, setDiedNowSettled] = useState(false)
  const t2Ref = useRef(null)

  useEffect(() => {
    const eps = episodes || []
    const t1 = setTimeout(() => {
      setDisplayEpisodeId(currentEpisodeId)
      setDiedNowSettled(false)

      // compute max shot delay for this episode
      const { diedThisEpisode } = computeStatuses(eps, currentEpisodeId)
      const maxShotDelay = Math.max(0, diedThisEpisode.size - 1) * 250 // ms
      const settledIn = maxShotDelay + 2200 + 1000 // last anim end + 1s pause

      t2Ref.current = setTimeout(() => setDiedNowSettled(true), settledIn)
    }, 550)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2Ref.current)
    }
  }, [currentEpisodeId, episodes])

  const { deadBefore, diedThisEpisode, reborn } = useMemo(
    () => computeStatuses(episodes || [], displayEpisodeId),
    [episodes, displayEpisodeId]
  )

  const statusOf = (id) => getStatus(id, deadBefore, diedThisEpisode, reborn)
  const diedNowOrder = useMemo(() => buildDiedNowOrder(diedThisEpisode), [diedThisEpisode])

  const handleClick = (c) => {
    if (onCharacterClick) onCharacterClick(c)
    setSelectedChar(c)
  }

  const renderChar = (c, status) => {
    const shotDelay = status === 'died-now'
      ? (diedNowOrder.get(c.id) ?? 0) * 0.25
      : 0

    const rebornDelay = status === 'reborn' ? getRebornDelay(c.id) : 0

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
          (status === 'died-now' && diedNowSettled ? ' clist__char--died-settled' : '') +
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
        <img src={c.preview} alt={c.name} className="clist__char-img" />
      </div>
    )
  }

  return (
    <div className="clist">
      <div className="clist__grid">
        {mainCast.map((c) => renderChar(c, statusOf(c.id)))}
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
