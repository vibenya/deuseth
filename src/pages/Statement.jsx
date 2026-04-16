import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Statement.css'

export default function Statement() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Statement — DeusETH'
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  const handleClose = useCallback(() => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }, [navigate])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <div className="stmt">
      <button
        type="button"
        className="stmt__close"
        onClick={handleClose}
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
      </button>
      <div className="stmt__inner">

        <header className="stmt__tombstone">
          <div className="stmt__eyebrow">
            <span>Wall Text</span>
            <span>On View 2018 — 2026</span>
          </div>
          <h1 className="stmt__title">DeusETH</h1>
          <p className="stmt__subtitle">A Crypto-Theatre in Ten Acts</p>
          <div className="stmt__meta">
            <span>The DeusETH Team</span>
            <span>Ethereum Mainnet · Generative Narrative · Smart Contract · 2018</span>
          </div>
        </header>

        <section className="stmt__section stmt__section--1">
          <div className="stmt__numeral">I</div>
          <h2 className="stmt__section-title">Algorithmic Fate</h2>
          <div className="stmt__section-body">
            <p>
              We did not kill our characters. The contract did. In the winter of
              2018 we deployed fifty tokens onto the Ethereum blockchain and
              handed each of them a single, irrevocable right: the right to be
              decided. Not by us, not by our audience, not by the market — but
              by a Park-Miller pseudo-random generator seeded from a committed
              block hash. We called this figure the Smart Contract of Deus ETH.
              It is the god of this world. We built it, and then we stepped back.
            </p>
          </div>
        </section>

        <section className="stmt__section stmt__section--2">
          <div className="stmt__numeral">II</div>
          <h2 className="stmt__section-title">Ethics of Participation</h2>
          <div className="stmt__section-body">
            <p>
              To own a token in DeusETH was not to collect. It was to enter a
              moral relation. Buyers did not purchase an image; they accepted
              custody of a life whose end had already been written into the
              chain. The interface offered no mercy function. We were
              interested, then as now, in the question that distributed systems
              almost never ask of their users: <em>what does it cost you that
              this continues?</em> Some owners mourned. Some resold. Some forgot.
              All of these are part of the work.
            </p>
          </div>
        </section>

        <section className="stmt__section stmt__section--3">
          <div className="stmt__numeral">III</div>
          <h2 className="stmt__section-title">Digital Mortality</h2>
          <div className="stmt__section-body">
            <p>
              Most blockchain art is a promise of permanence. DeusETH is a
              rehearsal for loss. Forty-seven of the fifty tokens were killed
              on-chain between March and April 2018. Three remain — Harold,
              Danko, Lucy. Their survival is not a story we authored; it is an
              artefact of code executing against entropy. In the contract's
              storage, <code>state = 1</code> still holds for their three ids.
              They are, in the strictest technical sense, alive. We cannot
              revoke that.
            </p>
          </div>
        </section>

        <div className="stmt__divider" />

        <p className="stmt__coda">
          This document is the curatorial frame of an artwork that has already
          finished speaking for itself. The chain does not need our commentary
          to remain true. But the chain does not know, on its own, that what
          it recorded was art. That recognition is a human act. This text is
          our part of it.
        </p>

        <div className="stmt__signature">
          — The DeusETH Team
          <span className="stmt__signature-year">2018 / 2026</span>
        </div>

      </div>
    </div>
  )
}
