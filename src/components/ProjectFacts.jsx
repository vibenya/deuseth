import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/ProjectFacts.css'

const WINNER_ETH = 4.119

const STATIC_FACTS = [
  { num: '$319', label: 'PER TOKEN', body: 'Each character cost 0.3 ETH — about $319 in January 2018. All 50 sold out in under 24 hours.' },
  { num: '28', label: 'DAYS', body: 'The entire show ran from March 16 to April 13, 2018. Ten episodes, 47 deaths, 3 survivors.' },
  { num: '49', label: 'REVIVALS', body: 'The Hard Fork brought back 49 dead tokens in a single burst — only Kesh was still alive and needed no saving.' },
  { num: '935', label: 'EVENTS', body: 'On-chain events reconstructed across 6 venues — from the original contracts to OpenSea Seaport.' },
  { num: '4.1', label: 'ETH WON', body: 'Each of the 3 winners claimed 4.119 ETH from the prize pool. None has transferred their token since.' },
  { num: '8', label: 'YEARS AGO', body: 'The contracts are still on Ethereum mainnet. The owner key is lost. The tokens are permanently frozen.' },
  { num: '7', label: 'CONTRACTS', body: 'Three generations deployed: v0a, v0b (failed), v1 (bugged), v2 (the real show), plus Randao, StockExchange, and FundsKeeper.' },
]

function formatUsd(n) {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return '$' + Math.round(n)
}

export default function ProjectFacts() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [ethPrice, setEthPrice] = useState(null)
  const intervalRef = useRef(null)
  const fadeRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(r => r.json())
      .then(d => setEthPrice(d.ethereum?.usd))
      .catch(() => {})
  }, [])

  const facts = [...STATIC_FACTS]
  if (ethPrice) {
    const prizeUsd = formatUsd(WINNER_ETH * ethPrice)
    facts.push({
      num: prizeUsd,
      label: 'TODAY',
      body: `Each winner's 4.119 ETH is worth ${prizeUsd} today. They paid $319 and claimed ~$2,000 in April 2018.`,
    })
  }

  function goTo(i) {
    clearTimeout(fadeRef.current)
    setVisible(false)
    fadeRef.current = setTimeout(() => { setIdx(i); setVisible(true) }, 350)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false)
      fadeRef.current = setTimeout(() => {
        setIdx(i => (i + 1) % (STATIC_FACTS.length + 1))
        setVisible(true)
      }, 450)
    }, 7000)
    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(fadeRef.current)
    }
  }, [])

  const fact = facts[idx % facts.length]

  return (
    <div className="ep-facts" onClick={() => navigate('/history', { state: { backgroundLocation: location } })} role="button" tabIndex={0}>
      <div className={`ep-facts__content${visible ? ' ep-facts__content--in' : ' ep-facts__content--out'}`}>
        <div className="ep-facts__left">
          <span className="ep-facts__num">{fact.num}</span>
          <span className="ep-facts__label">{fact.label}</span>
        </div>
        <p className="ep-facts__body">{fact.body}</p>
      </div>
      <div className="ep-facts__nav">
        <button className="ep-facts__arrow" onClick={(e) => { e.stopPropagation(); goTo((idx - 1 + facts.length) % facts.length) }} aria-label="Previous">
          <svg viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="ep-facts__arrow" onClick={(e) => { e.stopPropagation(); goTo((idx + 1) % facts.length) }} aria-label="Next">
          <svg viewBox="0 0 12 12" fill="none"><path d="M4.5 2L8.5 6L4.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  )
}
