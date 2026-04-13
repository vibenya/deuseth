import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AdvSlider from '../components/AdvSlider'
import Episode from '../components/Episode'
import Tokenville from '../components/Tokenville'
import DraftScreen from '../components/DraftScreen'
import logoWhite from '../images/logo-white.svg'
import '../styles/Adventures.css'

export default function Adventures() {
  const [draftDone, setDraftDone] = useState(() => !!localStorage.getItem('deus_draft'))
  const draftIds = JSON.parse(localStorage.getItem('deus_draft') || 'null')

  if (!draftDone) {
    return <DraftScreen onComplete={(ids) => {
      localStorage.setItem('deus_draft', JSON.stringify(ids))
      setDraftDone(true)
    }} />
  }

  const [episodes, setEpisodes] = useState([])
  const [activeId, setActiveId] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bottomBg, setBottomBg] = useState(null)
  const [topBg, setTopBg] = useState(null)
  const { episodeId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/data/adventures.json')
      .then(r => r.json())
      .then(data => {
        setEpisodes(data)
        if (episodeId !== undefined) {
          const found = data.find(ep => ep.path === episodeId || String(ep.id) === episodeId)
          if (found) setActiveId(found.id)
        }
      })
  }, [])

  useEffect(() => {
    if (episodes.length === 0) return
    if (episodeId !== undefined) {
      const found = episodes.find(ep => ep.path === episodeId || String(ep.id) === episodeId)
      if (found) setActiveId(found.id)
    }
  }, [episodeId, episodes])

  const activeEpisode = episodes.find(ep => ep.id === activeId)
  const activeIdx = episodes.findIndex(ep => ep.id === activeId)
  const hasNext = activeIdx < episodes.length - 1
  const hasPrev = activeIdx > 0

  useEffect(() => {
    const bg = activeEpisode?.background
    if (!bg) return
    setTopBg(bg)
    const t = setTimeout(() => {
      setBottomBg(bg)
      setTopBg(null)
    }, 800)
    return () => clearTimeout(t)
  }, [activeEpisode?.background])

  const handleChangeEpisode = useCallback((id) => {
    const ep = episodes.find(e => e.id === id)
    if (ep) {
      setActiveId(id)
      setDrawerOpen(false)
      navigate(`/adventures/${ep.path}`)
    }
  }, [episodes, navigate])

  const goNext = useCallback(() => {
    if (hasNext) {
      const next = episodes[activeIdx + 1]
      if (!next.disabled) handleChangeEpisode(next.id)
    }
  }, [episodes, activeIdx, hasNext, handleChangeEpisode])

  const goPrev = useCallback(() => {
    if (hasPrev) handleChangeEpisode(episodes[activeIdx - 1].id)
  }, [episodes, activeIdx, hasPrev, handleChangeEpisode])

  const isFinale = activeEpisode?.path === 'tokenville'

  return (
    <div className={`adventures adventures--fullscreen${isFinale ? ' adventures--finale' : ''}`}>
      {/* Blurred background — crossfade between episodes */}
      {!isFinale && bottomBg && (
        <div className="adventures__bg" style={{ backgroundImage: `url(${bottomBg})` }} />
      )}
      {!isFinale && topBg && (
        <div className="adventures__bg adventures__bg--fade-in" key={topBg} style={{ backgroundImage: `url(${topBg})` }} />
      )}

      {/* Top bar */}
      {!isFinale && (
        <div className="adventures__topbar">
          <Link to="/" className="adventures__topbar-logo">
            <img src={logoWhite} alt="DEUS ETH" />
          </Link>
          {activeEpisode && (
            <span className="adventures__topbar-title">
              {activeEpisode.number !== undefined && (
                <span className="adventures__topbar-ep">Ep. {activeEpisode.number}</span>
              )}
              {activeEpisode.title}
            </span>
          )}
          <nav className="adventures__topbar-nav">
            <Link to="/" className="adventures__topbar-link">История</Link>
            <Link to="/cast" className="adventures__topbar-link">Создатели</Link>
            <Link to="/faq" className="adventures__topbar-link">Что это?</Link>
          </nav>
        </div>
      )}

      {/* Episode player or Tokenville finale */}
      {activeEpisode && (
        isFinale
          ? <Tokenville />
          : <Episode
              episodeId={activeEpisode.id}
              number={activeEpisode.number}
              title={activeEpisode.title}
              text={activeEpisode.text}
              media={activeEpisode.media}
              rip={activeEpisode.rip}
              path={activeEpisode.path}
              comment={activeEpisode.comment}
              storyHeroIds={activeEpisode.storyHeroIds}
              videoEvents={activeEpisode.videoEvents}
              slideEvents={activeEpisode.slideEvents}
              episodes={episodes}
              draftIds={draftIds}
              onOpenDrawer={() => setDrawerOpen(true)}
              episodeNav={{
                current: activeIdx,
                total: episodes.length,
                prevEpisode: hasPrev ? episodes[activeIdx - 1] : null,
                nextEpisode: hasNext ? episodes[activeIdx + 1] : null,
                onPrev: goPrev,
                onNext: goNext,
              }}
            />
      )}

      {/* Bottom drawer */}
      {!isFinale && drawerOpen && (
        <div className="adventures__drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="adventures__drawer" onClick={e => e.stopPropagation()}>
            <div className="adventures__drawer-handle" onClick={() => setDrawerOpen(false)} />
            <div className="adventures__drawer-header">Episodes</div>
            {episodes.length > 0 && (
              <AdvSlider
                data={episodes}
                episodeActive={activeId}
                onChangeEpisode={handleChangeEpisode}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
