export default function CastHero({ name, ep, label }) {
  const epi = ep === 1 ? 'episode' : 'episodes'
  return (
    <dl className="cast-hero">
      <dt className="cast-hero__name">{name}</dt>
      <dd className="cast-hero__ep">
        {label ? <span>{label}</span> : <span>{ep} {epi}</span>}
      </dd>
    </dl>
  )
}
