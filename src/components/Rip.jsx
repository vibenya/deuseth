export default function Rip({ id, image, onClick }) {
  return (
    <figure onClick={() => onClick(id)} className="rip">
      <div className="rip__img-wrap">
        <img className="rip__image" src={image} alt="" />
      </div>
    </figure>
  )
}
