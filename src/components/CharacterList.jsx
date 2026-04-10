import { useState, useMemo } from 'react'
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

function getDiedNowIndex(id, diedThisEpisode) {
  const idx = [...diedThisEpisode].indexOf(id)
  return idx >= 0 ? idx : 0
}

export default function CharacterList({ currentEpisodeId, episodes, onCharacterClick }) {
  const [selectedChar, setSelectedChar] = useState(null)

  const { deadBefore, diedThisEpisode, reborn } = useMemo(
    () => computeStatuses(episodes || [], currentEpisodeId),
    [episodes, currentEpisodeId]
  )

  const statusOf = (id) => getStatus(id, deadBefore, diedThisEpisode, reborn)

  const handleClick = (c) => {
    if (onCharacterClick) onCharacterClick(c)
    setSelectedChar(c)
  }

  const renderChar = (c, status) => {
    const shotDelay = status === 'died-now'
      ? getDiedNowIndex(c.id, diedThisEpisode) * 0.25
      : 0

    const style = status === 'died-now' ? { '--shot-delay': `${shotDelay}s` } : {}

    return (
      <div
        key={c.id}
        className={
          'clist__char' +
          ` clist__char--${status}` +
          ((c.saleCount ?? 0) === 0 ? ' clist__char--unclaimed' : '')
        }
        style={style}
        onClick={() => handleClick(c)}
        title={(c.saleCount ?? 0) === 0 ? 'Never resold on secondary market' : c.name}
      >
        <img src={c.preview} alt={c.name} className="clist__char-img" />
        {status === 'died-now' && <div className="clist__skull" />}
        {status === 'dead' && <div className="clist__skull clist__skull--faded" />}
        {status === 'reborn' && <div className="clist__reborn-flash" />}
      </div>
    )
  }

  return (
    <div className="clist" key={currentEpisodeId}>
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
