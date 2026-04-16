import { useEffect, useRef, useState } from 'react'
import '../styles/TimelineNode.css'

export default function TimelineNode({ date, block }) {
  const ref = useRef(null)
  const [pulsed, setPulsed] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !pulsed) {
            setPulsed(true)
          }
        })
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pulsed])

  return (
    <div ref={ref} className={'tnode' + (pulsed ? ' tnode--pulse' : '')}>
      <div className="tnode__dot" />
      <div className="tnode__label">
        {date && <span className="tnode__label-date">{date}</span>}
        {block && <span className="tnode__label-block">BLK {block}</span>}
      </div>
    </div>
  )
}
