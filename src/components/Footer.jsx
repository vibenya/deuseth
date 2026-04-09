import { Link } from 'react-router-dom'
import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__copy">&copy; 2018 DEUS ETH &mdash; A Tokenville family project</p>
        <nav className="footer__nav">
          <Link to="/faq" className="footer__link">FAQ</Link>
          <Link to="/cast" className="footer__link">Cast</Link>
        </nav>
      </div>
    </footer>
  )
}
