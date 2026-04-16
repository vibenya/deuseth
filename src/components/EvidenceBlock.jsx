import '../styles/EvidenceBlock.css'

export default function EvidenceBlock({ exhibit, title, children }) {
  return (
    <section className="ev">
      {exhibit && <span className="ev__eyebrow">Exhibit · {exhibit}</span>}
      {title && <h3 className="ev__title">{title}</h3>}
      {children}
    </section>
  )
}
