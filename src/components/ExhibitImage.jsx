import { useState } from 'react'

export default function ExhibitImage({ src, alt, caption, exhibit, date, source, video, slides }) {
  const metaLine = [exhibit && `Exhibit ${exhibit}`, date, source]
    .filter(Boolean)
    .join(' · ')

  const isVideo = video || (src && /\.(mp4|webm)$/i.test(src))

  /* carousel mode */
  const [idx, setIdx] = useState(0)
  if (slides && slides.length > 0) {
    const cur = slides[idx]
    return (
      <figure className="exhibit">
        {metaLine && <span className="exhibit__meta">{metaLine}</span>}
        <div className="exhibit__carousel">
          <div className="exhibit__frame">
            <img src={cur.src} alt={cur.alt || ''} />
          </div>
          <div className="exhibit__carousel-controls">
            <button
              className="exhibit__carousel-btn"
              onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}
              aria-label="Previous"
            >
              ←
            </button>
            <span className="exhibit__carousel-counter">
              {idx + 1} / {slides.length}
            </span>
            <button
              className="exhibit__carousel-btn"
              onClick={() => setIdx((idx + 1) % slides.length)}
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
        {caption && <figcaption className="exhibit__caption">{caption}</figcaption>}
      </figure>
    )
  }

  return (
    <figure className="exhibit">
      {metaLine && <span className="exhibit__meta">{metaLine}</span>}
      <div className="exhibit__frame">
        {src ? (
          isVideo ? (
            <video src={src} muted loop playsInline autoPlay />
          ) : (
            <img src={src} alt={alt || ''} />
          )
        ) : (
          <div className="exhibit__placeholder">
            <span>[ image · {alt || 'user message'} ]</span>
          </div>
        )}
      </div>
      {caption && <figcaption className="exhibit__caption">{caption}</figcaption>}
    </figure>
  )
}
