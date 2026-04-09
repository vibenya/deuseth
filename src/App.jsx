import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Adventures from './pages/Adventures.jsx'
import FAQ from './pages/FAQ.jsx'
import Cast from './pages/Cast.jsx'

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <main className="app__content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adventures" element={<Adventures />} />
          <Route path="/adventures/:episodePath" element={<Adventures />} />
          <Route path="/adventures/:episodePath/story/:heroId" element={<Adventures />} />
          <Route path="/adventures/:episodePath/obit/:heroId" element={<Adventures />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/cast" element={<Cast />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
