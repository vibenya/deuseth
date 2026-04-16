import { useState, useCallback } from 'react'
import '../styles/ContractCard.css'

export default function ContractCard({ label, address, meta }) {
  const [copied, setCopied] = useState(false)
  const [flash, setFlash] = useState(false)

  const handleCopy = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!address) return
    navigator.clipboard?.writeText(address).then(() => {
      setCopied(true)
      setFlash(true)
      setTimeout(() => setCopied(false), 1200)
      setTimeout(() => setFlash(false), 500)
    })
  }, [address])

  const etherscanUrl = `https://etherscan.io/address/${address}`

  return (
    <a
      className="cc"
      href={etherscanUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="cc__top">
        <span className="cc__label">{label}</span>
        <span className="cc__ext" aria-hidden="true">↗</span>
      </div>
      <span
        className={'cc__address' + (flash ? ' cc__address--flash' : '')}
        onClick={handleCopy}
      >
        {address}
      </span>
      {meta && <div className="cc__meta">{meta}</div>}
      <span className={'cc__copied' + (copied ? ' is-visible' : '')}>copied</span>
    </a>
  )
}
