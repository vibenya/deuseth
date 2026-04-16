import { useState, useEffect, useRef } from 'react'
import '../styles/EpisodeFacts.css'

const FACTS = [
  { num: '50', label: 'TOKENS', body: '50 characters tokenized and sold as ERC-721 tokens to begin the race for survival.' },
  { num: '47', label: 'DEATHS', body: 'Smart contract events determined who lives and who dies — across 10 episodes.' },
  { num: '3', label: 'WINNERS', body: '3 characters survived and split the box office between their token holders.' },
  { num: '10', label: 'EPISODES', body: 'No script, no director\'s cut. Each episode\'s fate was written on-chain.' },
]

export default function EpisodeFacts() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const intervalRef = useRef(null)
  const fadeRef = useRef(null)

  function goTo(i) {
    clearTimeout(fadeRef.current)
    setVisible(false)
    fadeRef.current = setTimeout(() => { setIdx(i); setVisible(true) }, 350)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false)
      fadeRef.current = setTimeout(() => {
        setIdx(i => (i + 1) % FACTS.length)
        setVisible(true)
      }, 450)
    }, 7000)
    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(fadeRef.current)
    }
  }, [])

  const fact = FACTS[idx]

  return (
    <div className="ep-facts">
      <div className={`ep-facts__content${visible ? ' ep-facts__content--in' : ' ep-facts__content--out'}`}>
        <div className="ep-facts__left">
          <span className="ep-facts__num">{fact.num}</span>
          <span className="ep-facts__label">{fact.label}</span>
        </div>
        <p className="ep-facts__body">{fact.body}</p>
      </div>
      <div className="ep-facts__nav">
        <button className="ep-facts__arrow" onClick={() => goTo((idx - 1 + FACTS.length) % FACTS.length)} aria-label="Previous">
          <svg viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="ep-facts__arrow" onClick={() => goTo((idx + 1) % FACTS.length)} aria-label="Next">
          <svg viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  )
}
