import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdvSlider from '../components/AdvSlider'
import Episode from '../components/Episode'
import '../styles/Adventures.css'

export default function Adventures() {
  const [episodes, setEpisodes] = useState([])
  const [activeId, setActiveId] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
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

  return (
    <div className="adventures adventures--fullscreen">
      {/* Blurred background */}
      {activeEpisode && (
        <div className="adventures__bg" style={{ backgroundImage: `url(${activeEpisode.background})` }} />
      )}

      {/* Episode player */}
      {activeEpisode && (
        <Episode
          episodeId={activeEpisode.id}
          number={activeEpisode.number}
          title={activeEpisode.title}
          text={activeEpisode.text}
          media={activeEpisode.media}
          rip={activeEpisode.rip}
          path={activeEpisode.path}
          comment={activeEpisode.comment}
          storyHeroIds={activeEpisode.storyHeroIds}
          episodes={episodes}
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
