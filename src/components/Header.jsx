import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logoDefault from '../images/logo.svg'
import '../styles/Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const variant = 'header--light'

  // Preserve original background when jumping between modal routes
  const bgLocation = location.state?.backgroundLocation || location
  const modalState = { backgroundLocation: bgLocation }

  return (
    <header className={`header ${variant}`}>
      <div className="header__inner">
        <NavLink to="/" className="header__logo" onClick={() => setMenuOpen(false)}>
          <img src={logoDefault} alt="DEUS ETH" />
        </NavLink>

        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <NavLink
            to="/adventures"
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Episodes
          </NavLink>
          <NavLink
            to="/statement"
            state={modalState}
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Statement
          </NavLink>
          <NavLink
            to="/history"
            state={modalState}
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            History
          </NavLink>
        </nav>

        <div className="header__right" />
      </div>
    </header>
  )
}
