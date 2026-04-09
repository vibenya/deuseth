import { useState, useEffect, useMemo } from 'react'
import characters from '../data/characters.json'
import CastHero from '../components/CastHero'
import '../styles/Cast.css'

const PRODUCTION_TEAM = [
  { name: 'Ivan Sokolov', role: 'Creator & Writer' },
  { name: 'Artem Kolosov', role: 'Art Director' },
  { name: 'Dmitry Zakharov', role: 'Developer' },
  { name: 'Maria Petrova', role: 'Character Designer' },
]

export default function Cast() {
  const [heroEpisodes, setHeroEpisodes] = useState({})
  const [sortBy, setSortBy] = useState('episodes')

  useEffect(() => {
    fetch('/data/adventures.json')
      .then((r) => r.json())
      .then((adventures) => {
        const epCount = {}
        // Initialize all characters with 0
        characters.forEach((c) => { epCount[c.id] = 0 })

        // For each episode (skip prologue at index 0), if a hero is NOT in rip, they survived
        const episodes = adventures.filter((a) => a.id > 0)
        const cumulativeDead = new Set()
        episodes.forEach((ep) => {
          if (ep.rip) ep.rip.forEach(id => cumulativeDead.add(id))
          characters.forEach((c) => {
            if (!cumulativeDead.has(c.id)) {
              epCount[c.id] = (epCount[c.id] || 0) + 1
            }
          })
        })

        setHeroEpisodes(epCount)
      })
  }, [])

  // Only original 50 characters (id 1-50)
  const mainCast = useMemo(() => {
    const cast = characters
      .filter((c) => c.id >= 1 && c.id <= 50)
      .map((c) => ({ ...c, ep: heroEpisodes[c.id] || 0 }))

    if (sortBy === 'price') {
      return cast.sort((a, b) => (b.lastSalePrice ?? -1) - (a.lastSalePrice ?? -1))
    }
    return cast.sort((a, b) => b.ep - a.ep)
  }, [heroEpisodes, sortBy])

  const soldCount = mainCast.filter((c) => c.lastSalePrice != null).length
  const totalVolume = mainCast.reduce((sum, c) => sum + (c.lastSalePrice || 0), 0)

  return (
    <div className="cast">
      <div className="cast__all">
        <h1 className="cast__title">Cast</h1>

        <p className="cast__stat-bar">
          {soldCount} sold &middot; Ξ {totalVolume.toFixed(1)} total volume
        </p>

        <div className="cast__sort">
          <button
            className={`cast__sort-tab${sortBy === 'episodes' ? ' cast__sort-tab--active' : ''}`}
            onClick={() => setSortBy('episodes')}
          >
            By Episodes
          </button>
          <button
            className={`cast__sort-tab${sortBy === 'price' ? ' cast__sort-tab--active' : ''}`}
            onClick={() => setSortBy('price')}
          >
            By Price
          </button>
        </div>

        <div className="cast__all-heroes">
          {mainCast.map((hero) => (
            <CastHero key={hero.id} name={hero.name} ep={hero.ep} price={hero.lastSalePrice} />
          ))}
        </div>
      </div>

      <div className="cast__all">
        <h2 className="cast__title">Guest Star</h2>
        <div className="cast__all-heroes">
          <CastHero name="Vitalik Buterin" ep={2} label="as The Creator (2 episodes)" />
        </div>
      </div>

      <div className="cast__credits">
        <h2 className="cast__title">Production</h2>
        <div className="cast__authors">
          {PRODUCTION_TEAM.map((p) => (
            <CastHero key={p.name} name={p.name} label={p.role} />
          ))}
        </div>
      </div>

      <div className="cast__credits">
        <h2 className="cast__title">Special Thanks</h2>
        <p className="cast__thanks">
          To the Ethereum community for making this possible.
        </p>
        <p className="cast__thanks">
          Powered by{' '}
          <a
            className="cast__link"
            href="https://ethereum.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ethereum
          </a>
        </p>
      </div>
    </div>
  )
}
