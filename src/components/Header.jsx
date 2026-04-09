import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logoDefault from '../images/logo.svg'
import logoWhite from '../images/logo-white.svg'
import '../styles/Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const variant = isHome ? 'header--default' : 'header--light'

  return (
    <header className={`header ${variant}`}>
      <div className="header__inner">
        <NavLink to="/" className="header__logo" onClick={() => setMenuOpen(false)}>
          <img src={isHome ? logoWhite : logoDefault} alt="DEUS ETH" />
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
            to="/cast"
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Cast
          </NavLink>
          <NavLink
            to="/faq"
            className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </NavLink>
        </nav>

        <div className="header__right" />
      </div>
    </header>
  )
}
