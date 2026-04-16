import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Adventures from './pages/Adventures.jsx'
import Statement from './pages/Statement.jsx'
import History from './pages/History.jsx'
import Lore from './pages/Lore.jsx'
import NotFound from './pages/NotFound.jsx'

const MODAL_PATHS = ['/statement', '/history', '/lore']

function App() {
  const location = useLocation()
  const backgroundLocation = location.state?.backgroundLocation
  const isModalRoute = MODAL_PATHS.includes(location.pathname)

  // Background stays visible under modals. Preference order:
  // 1. explicit backgroundLocation from Link state (keeps whatever page user came from)
  // 2. Adventures as default backdrop for direct URL loads
  // 3. actual location otherwise
  const routingLocation = backgroundLocation
    || (isModalRoute ? { ...location, pathname: '/adventures' } : location)

  return (
    <div className="app">
      <ScrollToTop />
      <main className="app__content">
        <Routes location={routingLocation}>
          <Route path="/" element={<Navigate to="/adventures" replace />} />
          <Route path="/adventures" element={<Adventures />} />
          <Route path="/adventures/:episodePath" element={<Adventures />} />
          <Route path="/adventures/:episodePath/story/:heroId" element={<Adventures />} />
          <Route path="/adventures/:episodePath/obit/:heroId" element={<Adventures />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {isModalRoute && (
          <Routes>
            <Route path="/statement" element={<Statement />} />
            <Route path="/history" element={<History />} />
            <Route path="/lore" element={<Lore />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
