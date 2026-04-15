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
    const slugs = [
      '00_prologue', '01_bloody_kitties', '02_wolf_party', '03_freedom_to_die',
      '04_redrum', '05_murder', '06_the_final_battle', '07_scam',
      '08_hard_fork', '09_tokencide', '10_episode-x',
    ]
    Promise.all(slugs.map(s => fetch(`/data/episodes/${s}.json`).then(r => r.json())))
      .then((episodes) => {
        const epCount = {}
        characters.forEach((c) => { epCount[c.id] = 0 })

        // Compute cumulative dead set across episodes (skip prologue)
        const cumulativeDead = new Set()
        for (const ep of episodes) {
          if (ep.type === 'prologue') continue
          for (const evt of ep.events ?? []) {
            if (evt.action !== 'die' && evt.action !== 'revive') continue
            const ids = evt.characters === 'all'
              ? Array.from({ length: 50 }, (_, i) => i + 1)
              : evt.characters
            if (evt.action === 'die') ids.forEach(id => cumulativeDead.add(id))
            else ids.forEach(id => cumulativeDead.delete(id))
          }
          characters.forEach((c) => {
            if (!cumulativeDead.has(c.id)) epCount[c.id] = (epCount[c.id] || 0) + 1
          })
        }

        setHeroEpisodes(epCount)
      })
  }, [])

  // Only original 50 characters (id 1-50)
  const mainCast = useMemo(() => {
    const cast = characters
      .filter((c) => c.id >= 1 && c.id <= 50)
      .map((c) => ({ ...c, ep: heroEpisodes[c.id] || 0 }))

    const bestPrice = (c) => c.highestSalePrice ?? c.lastSalePrice ?? -1
    if (sortBy === 'price') {
      return cast.sort((a, b) => bestPrice(b) - bestPrice(a))
    }
    return cast.sort((a, b) => b.ep - a.ep)
  }, [heroEpisodes, sortBy])

  const soldCount = mainCast.filter((c) => (c.saleCount ?? 0) > 0).length
  const totalVolume = mainCast.reduce((sum, c) => sum + Math.max(0, c.highestSalePrice ?? c.lastSalePrice ?? 0), 0)

  return (
    <div className="cast">
      <div className="cast__all">
        <h1 className="cast__title">Cast</h1>

        <p className="cast__stat-bar">
          {soldCount} traded on secondary &middot; Ξ {totalVolume.toFixed(1)} peak total
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
