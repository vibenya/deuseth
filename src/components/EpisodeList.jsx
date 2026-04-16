export default function EpisodeList({ episodes, activeId, onChangeEpisode }) {
  return (
    <div className="ep-player__episode-list">
      {episodes.map(ep => (
        <div
          key={ep.id}
          className={
            'ep-ep-item' +
            (ep.id === activeId ? ' ep-ep-item--active' : '') +
            (ep.disabled ? ' ep-ep-item--disabled' : '')
          }
          onClick={() => !ep.disabled && onChangeEpisode(ep.id)}
        >
          <img src={ep.art?.slide} alt={ep.title} />
        </div>
      ))}
    </div>
  )
}
