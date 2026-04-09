import { Link } from 'react-router-dom'
import '../styles/Lineup.css'
import finalists from '../images/finalists.jpg'

export default function Lineup() {
  return (
    <section className="lineup">
      <div className="lineup__inner">
        <div className="lineup__text">
          <h2 className="lineup__title">Deus ETH winners</h2>
          <p className="lineup__para">
            Out of 50 tokenized characters, only 3 survived the adventure and shared the box office.
            Meet all 50 characters and discover their stories.
          </p>
        </div>
        <div className="lineup__people">
          <img src={finalists} alt="Deus ETH finalists" />
        </div>
        <Link className="lineup__btn btn" to="/cast">Meet the Cast</Link>
      </div>
    </section>
  )
}
