import { useState, useMemo, useRef, useEffect } from 'react'
import characters from '../data/characters.json'
import CharacterModal from './CharacterModal'
import '../styles/CharacterList.css'

const mainCast = characters.filter(c => c.collection === 'original' && c.id >= 1 && c.id <= 50)

function computeStatuses(episodes, currentEpisodeId) {
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

function getStatus(id, deadBefore, diedThisEpisode, reborn) {
  if (reborn.has(id)) return 'reborn'
  if (diedThisEpisode.has(id)) return 'died-now'
  if (deadBefore.has(id)) return 'dead'
  return 'alive'
}

export default function CharacterList({ currentEpisodeId, episodes, onCharacterClick }) {
  const [selectedChar, setSelectedChar] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const prevEpisodeRef = useRef(currentEpisodeId)

  const { deadBefore, diedThisEpisode, reborn } = useMemo(
    () => computeStatuses(episodes || [], currentEpisodeId),
    [episodes, currentEpisodeId]
  )

  const hasDiedNow = diedThisEpisode.size > 0

  // Suspense reveal: when episode changes and there are new deaths, delay reveal
  useEffect(() => {
    if (prevEpisodeRef.current !== currentEpisodeId) {
      prevEpisodeRef.current = currentEpisodeId
      if (hasDiedNow) {
        setRevealed(false)
        const timer = setTimeout(() => setRevealed(true), 1800)
        return () => clearTimeout(timer)
      }
    }
    setRevealed(true)
  }, [currentEpisodeId, hasDiedNow])

  const grouped = useMemo(() => {
    const alive = []
    const diedNow = []
    const dead = []
    const rebornList = []

    mainCast.forEach(c => {
      const status = getStatus(c.id, deadBefore, diedThisEpisode, reborn)
      if (status === 'alive') alive.push(c)
      else if (status === 'died-now') diedNow.push(c)
      else if (status === 'reborn') rebornList.push(c)
      else dead.push(c)
    })

    return { alive, diedNow, dead, reborn: rebornList }
  }, [deadBefore, diedThisEpisode, reborn])

  const statusOf = (id) => getStatus(id, deadBefore, diedThisEpisode, reborn)

  const handleClick = (c) => {
    setSelectedChar(c)
  }

  const renderChar = (c, status, index) => {
    const isHidden = status === 'died-now' && !revealed

    return (
      <div
        key={c.id}
        className={
          'clist__char' +
          ` clist__char--${status}` +
          (isHidden ? ' clist__char--hidden' : '') +
          (status === 'died-now' && revealed ? ' clist__char--reveal' : '')
        }
        style={{ '--i': index }}
        onClick={() => handleClick(c)}
        title={c.name}
      >
        <div className="clist__char-img-wrap">
          <img src={c.preview} alt={c.name} className="clist__char-img" />
          {status === 'died-now' && revealed && <div className="clist__skull">&#10013;</div>}
          {status === 'dead' && <div className="clist__skull clist__skull--faded">&#10013;</div>}
          {status === 'reborn' && <div className="clist__reborn-flash" />}
        </div>
        <span className="clist__char-name">{c.name}</span>
      </div>
    )
  }

  const total = mainCast.length

  return (
    <div className="clist" key={currentEpisodeId}>
      <div className="clist__header">
        <span className="clist__header-title">Elimination Board</span>
        <span className="clist__header-count">
          <span className="clist__alive-count">{grouped.alive.length}</span>
          <span className="clist__alive-slash">/</span>
          <span className="clist__total-count">{total}</span>
          <span className="clist__alive-label">alive</span>
        </span>
      </div>

      {grouped.diedNow.length > 0 && (
        <div className="clist__section clist__section--died-now">
          <div className="clist__section-head">
            <span className="clist__section-icon">&#10013;</span>
            <span className="clist__section-title">
              {revealed ? 'R.I.P. This Episode' : 'Revealing...'}
            </span>
            <span className="clist__section-count">{revealed ? grouped.diedNow.length : '?'}</span>
          </div>
          {!revealed && (
            <div className="clist__suspense-bar">
              <div className="clist__suspense-fill" />
            </div>
          )}
          <div className="clist__grid clist__grid--died-now">
            {grouped.diedNow.map((c, i) => renderChar(c, 'died-now', i))}
          </div>
        </div>
      )}

      {grouped.reborn.length > 0 && (
        <div className="clist__section clist__section--reborn">
          <div className="clist__section-head">
            <span className="clist__section-icon">&#9734;</span>
            <span className="clist__section-title">Reborn</span>
            <span className="clist__section-count">{grouped.reborn.length}</span>
          </div>
          <div className="clist__grid clist__grid--reborn">
            {grouped.reborn.map((c, i) => renderChar(c, 'reborn', i))}
          </div>
        </div>
      )}

      {grouped.alive.length > 0 && (
        <div className="clist__section clist__section--alive">
          <div className="clist__section-head">
            <span className="clist__section-title">Alive</span>
            <span className="clist__section-count">{grouped.alive.length}</span>
          </div>
          <div className="clist__grid">
            {grouped.alive.map((c, i) => renderChar(c, 'alive', i))}
          </div>
        </div>
      )}

      {grouped.dead.length > 0 && (
        <div className="clist__section clist__section--dead">
          <div className="clist__section-head">
            <span className="clist__section-title">Fallen</span>
            <span className="clist__section-count">{grouped.dead.length}</span>
          </div>
          <div className="clist__grid clist__grid--dead">
            {grouped.dead.map((c, i) => renderChar(c, 'dead', i))}
          </div>
        </div>
      )}

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
