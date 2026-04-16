import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../images/logo.svg'
import '../styles/Header.css'

/**
 * Unified topbar: logo + dashboard nav buttons.
 * @param {object}  props
 * @param {string}  [props.variant]  — 'intro' for dark background
 * @param {boolean} [props.inline]   — true = desktop inline (inside ep-player__left)
 * @param {object}  [props.episode]  — show episode title on mobile bar
 */
export default function Header({ variant, inline, episode }) {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  const bgLocation = location.state?.backgroundLocation || location
  const modalState = { backgroundLocation: bgLocation }

  const cls = [
    'header',
    inline ? 'header--inline' : '',
    variant === 'intro' ? 'header--intro' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <Link to="/" className="header__logo">
        <img src={logo} alt="DEUS ETH" />
      </Link>

      {!inline && episode && (
        <span className="header__title">
          {episode.number !== undefined && (
            <span className="header__ep">Ep. {episode.number}</span>
          )}
          {episode.title}
        </span>
      )}

      <nav className={`header__nav${navOpen ? ' is-open' : ''}`}>
        <Link
          to="/statement"
          state={modalState}
          className="header__dash-btn"
          onClick={() => setNavOpen(false)}
        >
          {/* Lucide: scroll-text */}
          <svg className="header__dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 12h-5" /><path d="M15 8h-5" /><path d="M19 17V5a2 2 0 0 0-2-2H4" />
            <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2" />
          </svg>
          <span className="header__dash-label">Statement</span>
        </Link>
        <Link
          to="/lore"
          state={modalState}
          className="header__dash-btn"
          onClick={() => setNavOpen(false)}
        >
          {/* Lucide: book-open-text */}
          <svg className="header__dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 7v14" /><path d="M16 12h2" /><path d="M16 8h2" />
            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
          </svg>
          <span className="header__dash-label">Lore</span>
        </Link>
        <Link
          to="/history"
          state={modalState}
          className="header__dash-btn"
          onClick={() => setNavOpen(false)}
        >
          {/* Lucide: landmark */}
          <svg className="header__dash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" />
            <line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" />
            <line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" />
            <line x1="2" x2="22" y1="18" y2="18" />
          </svg>
          <span className="header__dash-label">History</span>
        </Link>
      </nav>

      <button
        type="button"
        className={`header__burger${navOpen ? ' is-open' : ''}`}
        onClick={() => setNavOpen(v => !v)}
        aria-label="Menu"
      >
        <span /><span /><span />
      </button>
    </div>
  )
}
