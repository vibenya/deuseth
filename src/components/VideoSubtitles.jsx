import { useState, useEffect, useRef } from 'react'
import '../styles/VideoSubtitles.css'

function parseVTT(text) {
  const cues = []
  const blocks = text.trim().split(/\n\n+/)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const timingIdx = lines.findIndex(l => l.includes('-->'))
    if (timingIdx === -1) continue
    const m = lines[timingIdx].match(/([\d:\.]+)\s*-->\s*([\d:\.]+)/)
    if (!m) continue
    const start = timeToSec(m[1])
    const end = timeToSec(m[2])
    const content = lines.slice(timingIdx + 1).join(' ').replace(/&nbsp;/g, '\u00a0').trim()
    if (content) cues.push({ start, end, content })
  }
  return cues
}

function timeToSec(t) {
  const parts = t.trim().split(':')
  let sec = 0
  for (const p of parts) sec = sec * 60 + parseFloat(p)
  return sec
}

export default function VideoSubtitles({ subtitles, currentTime }) {
  const [tracks, setTracks] = useState({}) // lang -> cues[]
  const [activeLang, setActiveLang] = useState(null)
  const [currentCue, setCurrentCue] = useState(null)
  const [visible, setVisible] = useState(true)
  const prevCueRef = useRef(null)
  const [animate, setAnimate] = useState(false)

  // Load subtitle files
  useEffect(() => {
    if (!subtitles?.length) return
    const loaded = {}
    Promise.all(
      subtitles.map(({ lang, src }) =>
        fetch(src)
          .then(r => r.text())
          .then(text => { loaded[lang] = parseVTT(text) })
          .catch(() => {})
      )
    ).then(() => {
      setTracks(loaded)
      if (!activeLang && subtitles.length > 0) {
        setActiveLang(subtitles[0].lang)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitles])

  // Find active cue
  useEffect(() => {
    if (!activeLang || !tracks[activeLang] || currentTime == null) {
      setCurrentCue(null)
      return
    }
    const cue = tracks[activeLang].find(c => currentTime >= c.start && currentTime < c.end) || null
    if (cue !== prevCueRef.current) {
      prevCueRef.current = cue
      if (cue) {
        setAnimate(false)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimate(true))
        })
      }
      setCurrentCue(cue)
    }
  }, [currentTime, activeLang, tracks])

  if (!subtitles?.length) return null

  return (
    <div className="vsubs">
      {/* Language selector */}
      <div className="vsubs__controls">
        <button
          className={`vsubs__toggle${visible ? ' is-active' : ''}`}
          onClick={() => setVisible(v => !v)}
          title={visible ? 'Hide subtitles' : 'Show subtitles'}
        >
          CC
        </button>
        {visible && subtitles.map(({ lang, label }) => (
          <button
            key={lang}
            className={`vsubs__lang${activeLang === lang ? ' is-active' : ''}`}
            onClick={() => setActiveLang(lang)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Subtitle text */}
      {visible && currentCue && (
        <div className={`vsubs__text${animate ? ' vsubs__text--in' : ''}`}>
          {currentCue.content}
        </div>
      )}
    </div>
  )
}
