import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/NotFound.css'

export default function NotFound() {
  useEffect(() => {
    document.title = '404 — DeusETH'
  }, [])

  return (
    <div className="nf">
      <div className="nf__grain" />
      <div className="nf__inner">
        <div className="nf__card">
          <img
            src="/images/cards/card_00005.png"
            alt="Harold"
            className="nf__img"
          />
        </div>

        <div className="nf__text">
          <h1 className="nf__code">404</h1>
          <p className="nf__msg">
            Congratulations, you found the 404 page.<br />
            But that means the page was not found.
          </p>
          <Link to="/adventures" className="nf__link">
            Back to Adventures
          </Link>
        </div>
      </div>
    </div>
  )
}
