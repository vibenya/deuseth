import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdvSlider from '../components/AdvSlider'
import Episode from '../components/Episode'
import Header from '../components/Header'
import { fetchAllEpisodes } from '../utils/episodeData'
import '../styles/Adventures.css'

export default function Adventures() {
  const [episodes, setEpisodes] = useState([])
  const [activeId, setActiveId] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { episodePath } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAllEpisodes()
      .then(data => {
        setEpisodes(data)
        if (episodePath !== undefined) {
          const found = data.find(ep => ep.slug === episodePath || String(ep.id) === episodePath)
          if (found) setActiveId(found.id)
        }
      })
  }, [])

  useEffect(() => {
    if (episodes.length === 0) return
    if (episodePath !== undefined) {
      const found = episodes.find(ep => ep.slug === episodePath || String(ep.id) === episodePath)
      if (found) setActiveId(found.id)
    }
  }, [episodePath, episodes])

  const activeEpisode = episodes.find(ep => ep.id === activeId) || null
  const activeIdx = episodes.findIndex(ep => ep.id === activeId)
  const hasNext = activeIdx < episodes.length - 1
  const hasPrev = activeIdx > 0

  const handleChangeEpisode = useCallback((id) => {
    const ep = episodes.find(e => e.id === id)
    if (ep) {
      setActiveId(id)
      setDrawerOpen(false)
      navigate(`/adventures/${ep.slug}`)
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

  return (
    <div className={`adventures adventures--fullscreen${activeId === 0 ? ' adventures--intro' : ''}`}>
      {/* Mobile top bar */}
      <div className="adventures__topbar-mobile">
        <Header
          variant={activeId === 0 ? 'intro' : undefined}
          episode={activeEpisode}
        />
      </div>

      {/* Episode player */}
      {activeEpisode && (
        <Episode
          episode={activeEpisode}
          episodes={episodes}
          onOpenDrawer={() => setDrawerOpen(true)}
          activeId={activeId}
          onChangeEpisode={handleChangeEpisode}
          topbarSlot={
            <Header
              inline
              variant={activeId === 0 ? 'intro' : undefined}
            />
          }
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
      {drawerOpen && (
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
