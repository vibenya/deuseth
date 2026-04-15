import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAllEpisodes } from '../utils/episodeData'
import '../styles/EpisodesList.css'

export default function EpisodesList() {
  const [episodes, setEpisodes] = useState([])

  useEffect(() => {
    fetchAllEpisodes().then(setEpisodes).catch(console.error)
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
