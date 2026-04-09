export default function CastHero({ name, ep, label, price }) {
  const epi = ep === 1 ? 'episode' : 'episodes'
  const priceText = price != null ? `Ξ ${price}` : 'Never sold'
  return (
    <dl className="cast-hero">
      <dt className="cast-hero__name">{name}</dt>
      <dd className="cast-hero__ep">
        {label ? <span>{label}</span> : <span>{ep} {epi}</span>}
      </dd>
      {price !== undefined && (
        <dd className="cast-hero__price">{priceText}</dd>
      )}
    </dl>
  )
}
