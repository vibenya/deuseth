import '../styles/Feature.css'

export default function Feature({ url, title, text }) {
  return (
    <div className="feature">
      <img className="feature__img" src={url} alt={title} />
      <div className="feature__sub">{title}</div>
      <div className="feature__text">{text}</div>
    </div>
  )
}
