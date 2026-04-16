export default function ExhibitImage({ src, alt, caption, exhibit, date, source }) {
  const metaLine = [exhibit && `Exhibit ${exhibit}`, date, source]
    .filter(Boolean)
    .join(' · ')

  return (
    <figure className="exhibit">
      {metaLine && <span className="exhibit__meta">{metaLine}</span>}
      <div className="exhibit__frame">
        {src ? (
          <img src={src} alt={alt || ''} />
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
