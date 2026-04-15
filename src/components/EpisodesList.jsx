import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/EpisodesList.css'

export default function EpisodesList() {
  const [episodes, setEpisodes] = useState([])

  useEffect(() => {
    const slugs = [
      '00_prologue', '01_bloody_kitties', '02_wolf_party', '03_freedom_to_die',
      '04_redrum', '05_murder', '06_the_final_battle', '07_scam',
      '08_hard_fork', '09_tokencide', '10_episode-x',
    ]
    Promise.all(slugs.map(s => fetch(`/data/episodes/${s}.json`).then(r => r.json())))
      .then(setEpisodes)
      .catch(console.error)
  }, [])

  return (
    <section className="episodes-list">
      <div className="episodes-list__inner">
        <h2 className="episodes-list__title">Episodes</h2>
        <p className="episodes-list__text">
          Follow the journey of 50 tokenized characters across 10 episodes,
          where blockchain events determined who lived and who died.
        </p>
        <div className="episodes-list__items">
          {episodes.map(ep => (
            <div className="episodes-list__item" key={ep.id}>
              <Link className="episodes-list__link" to={`/adventures/${ep.slug}`}>
                <img src={ep.art?.homeSlide} alt={ep.title} />
                <div className="episodes-list__it-text">
                  <div className="episodes-list__it-number">{ep.number}</div>
                  <div className="episodes-list__it-title">{ep.title}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
