import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ContractCard from '../components/ContractCard'
import TimelineNode from '../components/TimelineNode'
import EvidenceBlock from '../components/EvidenceBlock'
import ExhibitImage from '../components/ExhibitImage'
import '../styles/History.css'

/* ------------------------------------------------------------------ */
/*  Internal Section — IntersectionObserver fade-in + TimelineNode    */
/* ------------------------------------------------------------------ */

function Section({ marker, title, date, block, children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            io.unobserve(el)
          }
        })
      },
      { rootMargin: '-15% 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className={'hist__section' + (visible ? ' is-visible' : '')}
    >
      <TimelineNode date={date} block={block} />
      <div className="hist__section-meta-mobile">
        {date && <span>{date}</span>}
        {block && <span>BLK {block}</span>}
      </div>
      {marker && <span className="hist__section-marker">{marker}</span>}
      {title && <h2 className="hist__section-title">{title}</h2>}
      <div className="hist__section-body">{children}</div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Episode reconstruction table                                       */
/* ------------------------------------------------------------------ */

const EPISODES = [
  { ep: 1, block: '5266284', date: '2018-03-16 15:37', ids: [13, 44, 48], museum: 'I. Bloody Kitties' },
  { ep: 2, block: '5290611', date: '2018-03-20 18:16', ids: [5, 25, 27, 29, 41, 42, 45], museum: 'II. Wolf Party' },
  { ep: 3, block: '5309075', date: '2018-03-23 20:03', ids: [6, 17, 32, 37, 38], museum: 'III. Freedom to Die' },
  { ep: 4, block: '5325705', date: '2018-03-26 14:27', ids: [4], museum: 'V. Murder' },
  { ep: 5, block: '5349842', date: '2018-03-30 16:20', ids: [3, 11, 12, 15, 19, 20, 21, 23, 28, 30, 31, 36, 43, 50], museum: 'VI. The Final Battle' },
  { ep: 6, block: '5374477', date: '2018-04-03 18:21', ids: [1, 2, 7, 8, 9, 10, 14, 16, 18, 22, 24, 26, 33, 34, 35, 40, 46, 47, 49], museum: 'VII. Scam' },
  { ep: '—', block: '5391340', date: '2018-04-06 13:30', ids: null, museum: 'VIII. Hard Fork · mass revival (49 tokens)', revive: true },
  { ep: 7, block: '5422092', date: '2018-04-11 15:39', ids: [45], note: '45 dead', museum: 'IX. Tokencide' },
  { ep: 8, block: '5434017', date: '2018-04-13 16:03', ids: [18, 36], museum: 'X. Tokenville' },
]

function EpisodeTable() {
  return (
    <div className="hist__table-wrap">
      <table className="hist__table">
        <thead>
          <tr>
            <th>Chain Ep</th>
            <th>Block</th>
            <th>Date (UTC)</th>
            <th>Token IDs</th>
            <th>Museum Episode</th>
          </tr>
        </thead>
        <tbody>
          {EPISODES.map((e, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--hist-coral)' }}>{e.ep}</td>
              <td>{e.block}</td>
              <td>{e.date}</td>
              <td>
                {e.revive ? (
                  <span className="hist-mono-dim" style={{ fontStyle: 'italic' }}>
                    49 revivals
                  </span>
                ) : e.ep === 7 ? (
                  <span className="hist-mono-dim">
                    all except [5, 10, 11, 18, 36]
                  </span>
                ) : (
                  <div className="hist__table-chips">
                    {e.ids && e.ids.map((id) => (
                      <span key={id} className="hist__chip">{id}</span>
                    ))}
                  </div>
                )}
              </td>
              <td className="hist__table-ep">{e.museum}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function History() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'History — DeusETH'
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
    <div className="hist">
      <button
        type="button"
        className="hist__close"
        onClick={handleClose}
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
        </svg>
      </button>

      {/* ---------- Hero ---------- */}
      <header className="hist__hero">
        <div className="hist__hero-eyebrow">
          <span>Field Report</span>
          <span className="hist__hero-eyebrow-divider">·</span>
          <span>Media Archaeology</span>
          <span className="hist__hero-eyebrow-divider">·</span>
          <span>DeusETH, 2018</span>
        </div>

        <div className="hist__hero-body">
          <h1 className="hist__hero-title">
            On-Chain Archaeology<br />of DeusETH
          </h1>
          <p className="hist__hero-subtitle">
            A forensic reconstruction of a 2018 crypto-theatre — contract by
            contract, block by block, death by death — assembled from public
            Ethereum state and archived community records.
          </p>

          <div className="hist__hero-fieldnote">
            <div className="hist__hero-field">
              <span className="hist__hero-field-label">Filed</span>
              <span className="hist__hero-field-value">2026-04-15</span>
            </div>
            <div className="hist__hero-field">
              <span className="hist__hero-field-label">Chain</span>
              <span className="hist__hero-field-value">ethereum mainnet</span>
            </div>
            <div className="hist__hero-field">
              <span className="hist__hero-field-label">Provenance</span>
              <span className="hist__hero-field-value">public RPC</span>
            </div>
            <div className="hist__hero-field">
              <span className="hist__hero-field-label">Events</span>
              <span className="hist__hero-field-value">935 reconstructed</span>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Article ---------- */}
      <article className="hist__article">
        <div className="hist__rail" />

        {/* §01 */}
        <Section
          marker="§ 01 · Pre-history"
          title="The First Deployments That Failed"
          date="2017-12-29"
          block="4872000"
        >
          <p>
            Before there was a show, there were failures. On December 29, 2017,
            the same deployer wallet — <span className="hist-mono">0xb8579b19…5ca</span> —
            pushed two complete contract pairs onto mainnet within five hours of
            each other. Neither was announced. Neither was ever played. Both
            exist permanently, waiting for queries that will never come.
          </p>
          <p>
            The first pair (<em>v0a</em>, nonces 0–2) was deployed at 11:16 UTC
            and linked to its lottery a minute later. A bug was found. By 16:06
            UTC, the second pair (<em>v0b</em>, nonces 6–8) was on-chain with the
            fix. Neither was ever made public; the 50 token purchases that
            actually launched the game did not begin until January 30, 2018.
          </p>
          <p>
            These addresses are what archaeology calls <em>negative evidence</em>
            — the shape of a mistake, permanently preserved. They are also the
            first works in the DeusETH corpus.
          </p>

          <div className="hist__cards">
            <ContractCard
              label="DeusETH v0a"
              address="0x3178abbc96938f3c19ce6e9f4aed5be03d985c48"
              meta="2017-12-29 · Nonce 1 · Bug found, never public"
            />
            <ContractCard
              label="DeusETH v0b"
              address="0x3b2501c8830184a659cb65bd1f02a2733310bf00"
              meta="2017-12-29 · Nonce 7 · Fixed, still never public"
            />
          </div>
        </Section>

        {/* §02 */}
        <Section
          marker="§ 02 · v1"
          title="The Public Launch And Its Second Bug"
          date="2018-01-29"
          block="4987000"
        >
          <p>
            DeusETH <em>v1</em> went public on January 29, 2018. It was not an
            ERC-721 — the standard was still forming. Instead it was a custom
            contract with <code className="hist-mono">cap = 50</code>, buyers
            calling <code className="hist-mono">buyTokens(_id)</code> with 0.3 ETH
            to explicitly choose their character.
          </p>
          <p>
            Within one day, all 50 tokens were purchased. Fifty
            <span className="hist-mono"> TokenHolder </span>
            events were emitted and are still queryable. Then the first episode
            attempt hit a bug the team could not patch in place. A full
            redeploy was required. No deaths were ever recorded on v1; it holds
            50 births and zero funerals.
          </p>

          <div className="hist__cards hist__cards--narrow">
            <ContractCard
              label="DeusETH v1"
              address="0xe46b5f1f3551bd3c6b29c38babc662b03d985c48"
              meta="2018-01-29 · Nonce 13 · 50 births, 0 deaths"
            />
          </div>
        </Section>

        {/* §03 */}
        <Section
          marker="§ 03 · v2"
          title="The Redeploy — Where the Show Actually Ran"
          date="2018-03-14"
          block="5245000"
        >
          <p>
            On March 14, 2018, a third and final generation of contracts went
            live: a new lottery, a stock exchange for secondary trading, and a
            prize-keeping bank. Token IDs were preserved from v1 — the mapping
            of <code className="hist-mono">tokenId == character.id</code> has
            been stable ever since.
          </p>
          <p>
            Victim selection used a Randao commit-reveal deployed three weeks
            earlier. Its seed, recorded before block 5133039, feeds a
            Park-Miller PRNG that deterministically picks the ids who die in
            each episode. The procedure is reproducible from public chain data
            alone — we have verified it.
          </p>

          <div className="hist__cards">
            <ContractCard
              label="DeusETH v2"
              address="0x2c7411ecd2110b7760627880f1860646a265c5df"
              meta="2018-03-14 · Nonce 40 · The canonical lottery"
            />
            <ContractCard
              label="StockExchange v2"
              address="0x5a90405495da32569a208a992a574e59a75788a2"
              meta="2018-03-14 · Nonce 42 · Secondary market"
            />
            <ContractCard
              label="FundsKeeper v2"
              address="0x96288906f3a363e98b0595a9205f5c9e31e9a3c1"
              meta="2018-03-14 · Nonce 39 · Prize bank"
            />
            <ContractCard
              label="Randao"
              address="0xfe7e9141d1ec8d30a37f9908cd93eadd7a2d9d9b"
              meta="2018-02-22 · Nonce 26 · Seeded the deaths"
            />
          </div>
        </Section>

        {/* §04 */}
        <Section
          marker="§ 04 · The Episodes"
          title="Ten Acts, Reconstructed by Block"
          date="2018-03-16"
          block="5266284"
        >
          <p>
            The entire show is present on chain as a sequence of{' '}
            <span className="hist-mono">TokenState(id, state)</span> events. We
            cluster them by block proximity (&lt;1000 blocks apart) to recover
            episode boundaries. The result, cross-referenced against the
            narrative record, is the table below. Every row is a museum episode;
            every id is a character death, emitted and signed by a pseudo-random
            god that answers to no author.
          </p>

          <EpisodeTable />

          <p>
            Two totals reconcile the whole run:{' '}
            <strong>96 <span className="hist-mono-dim">TokenState(_, 0)</span> deaths</strong>,{' '}
            <strong>99 <span className="hist-mono-dim">TokenState(_, 1)</span> revivals</strong>.
            The math requires a particular note about Kesh.
          </p>

          <div className="sidenote">
            <span className="sidenote__label">Sidenote · Token 39</span>
            Across every episode from March 16 through April 3, exactly one
            token was never killed: <strong>Kesh</strong>. As a result the
            Hard Fork revival batch contains 49 <code className="hist-mono">TokenState(_, 1)</code>{' '}
            events, not 50 — Kesh was already alive and needed no state
            change. Kesh did eventually die in Tokencide. The absence of
            its revival event is the only on-chain proof of its survival
            through the first seven episodes.
          </div>
        </Section>

        {/* §05 */}
        <Section
          marker="§ 05 · The Hard Fork"
          title="A Mass Revival, Recorded"
          date="2018-04-06"
          block="5391340"
        >
          <p>
            On April 6, 2018, between blocks 5391340 and 5391367, 49 of the
            dead were returned to <code className="hist-mono">state = 1</code>{' '}
            in a single burst. The team called it the Hard Fork. Narratively it
            was a second chance; technically it was a batched write against
            lottery storage. Both descriptions are true at once.
          </p>
          <p>
            The revival is irreversible in both senses. The chain has preserved
            it. The audience, reading the transactions today, must contend with
            the fact that the show's most theatrical moment was also its most
            literal — a write to a mapping.
          </p>
        </Section>

        {/* §06 — Exhibits */}
        <Section
          marker="§ 06 · Reception"
          title="Exhibit A — Witnessed in Real Time"
          date="2018-03 → 04"
        >
          <p>
            The contracts are the primary document. What follows is supporting
            evidence: archived messages, reactions, and screenshots from
            participants who watched the show as it ran, on the only network
            that ever published it. These materials place DeusETH inside a
            receiving community — the minimum condition, by most curatorial
            standards, for something to be called a work.
          </p>

          <div className="hist__exhibits-grid">
            <ExhibitImage
              exhibit="A.1"
              date="2018-03-20"
              source="Telegram"
              alt="community reaction to Wolf Party deaths"
              caption="A participant reacts to the second episode's death list within the hour of its broadcast."
            />
            <ExhibitImage
              exhibit="A.2"
              date="2018-04-06"
              source="Telegram"
              alt="announcement of the Hard Fork"
              caption="The team announces the Hard Fork revival to the audience. Archived by a community member."
            />
            <ExhibitImage
              exhibit="A.3"
              date="2018-04-13"
              source="Telegram"
              alt="Tokenville survivors moment"
              caption="The end of the show — three token ids remain at state = 1. Witnessed live."
            />
            <ExhibitImage
              exhibit="A.4"
              date="2018"
              source="Community archive"
              alt="early secondary market reaction"
              caption="Listings on the v1 stock exchange during the first speculative week."
            />
          </div>

          <p>
            These exhibits are placeholders for archival images the team is
            assembling. Their function here is formal, not illustrative — a
            work of this kind must be shown to have been <em>seen</em>, not
            merely executed.
          </p>
        </Section>

        {/* §07 — Gary Evidence */}
      </article>

      <EvidenceBlock exhibit="B · Token 13" title="Gary's Arc — minted, burned, memorialized">
        <div className="ev-grid">
          <div className="ev-grid__narrative">
            <p>
              Of the 69 tokens minted on the post-show v3 ERC-721 relaunch,
              exactly one was sent to the burn address. It was token 13, Gary.
              The holder, having bought him on OpenSea in 2021 for 2.0 ETH,
              transferred him to <span className="hist-mono">0x000…dEaD</span>{' '}
              on January 1, 2024 — a ritual burn, not a contract call.
            </p>
            <p>
              Gary's ten-step arc is the single most-documented lifecycle in
              the project: minted for 0.3 ETH, sold at 0.8 ETH, migrated via
              the team, re-minted on v3, resold for 0.1 ETH in 2018, and
              finally achieved the project's all-time high resale of 2.0 ETH
              in 2021 — before being voluntarily destroyed.
            </p>
            <p>
              No other v3 token is at the burn address. This is an artefact
              we did not plan for and cannot take credit for. A participant
              extended the work.
            </p>
          </div>

          <ol className="gary-ladder">
            <li><span className="gary-ladder__date">2018-01-30</span><span className="gary-ladder__event"> bought on v1 · 0.3 ETH</span></li>
            <li><span className="gary-ladder__date">2018-01-30</span><span className="gary-ladder__event"> listed on v1 StockExchange · 4.0 ETH</span></li>
            <li><span className="gary-ladder__date">2018-02-01</span><span className="gary-ladder__event"> relisted at 0.8 ETH</span></li>
            <li><span className="gary-ladder__date">2018-02-20</span><span className="gary-ladder__event"> sold on v1 · 0.8 ETH</span></li>
            <li><span className="gary-ladder__date">2018-03-16</span><span className="gary-ladder__event"> migrated to v2 (team-held)</span></li>
            <li><span className="gary-ladder__date">2018-03-27</span><span className="gary-ladder__event"> delisted · no buyer</span></li>
            <li><span className="gary-ladder__date">2018-04-24</span><span className="gary-ladder__event"> minted on v3 ERC-721</span></li>
            <li><span className="gary-ladder__date">2018-05-01</span><span className="gary-ladder__event"> sold on DeusMarketplace · 0.1 ETH</span></li>
            <li><span className="gary-ladder__date">2021-08-30</span><span className="gary-ladder__event"> resold on OpenSea Wyvern · 2.0 ETH</span></li>
            <li className="gary-ladder__final">
              <div className="gary-ladder__final-line">2024-01-01 — Burned.</div>
              <div className="gary-ladder__final-addr">0x000000000000000000000000000000000000dEaD</div>
            </li>
          </ol>
        </div>
      </EvidenceBlock>

      <article className="hist__article">
        <div className="hist__rail" />

        {/* §08 — Lost Key */}
        <Section
          marker="§ 08 · Inaccessible"
          title="The Lost Key"
          date="2018 → now"
        >
          <p>
            The v3 ERC-721's{' '}
            <code className="hist-mono">setTokenURI</code> is{' '}
            <code className="hist-mono">onlyOwner</code>. Ownership was
            transferred from the deployer to wallet{' '}
            <span className="hist-mono">0x1fed…91b8</span> at some point in
            the project's life, and the private key to that wallet has since
            been lost.
          </p>
          <p>
            The practical consequence is exact:{' '}
            <code className="hist-mono">tokenURI(id)</code> returns the empty
            string for all 69 tokens, permanently. No marketplace or wallet
            can resolve character metadata. The images, names, and histories
            that once rendered are now unreachable by the chain itself. The
            museum site you are reading is the only remaining display.
          </p>
          <p>
            We take no position on whether this is a loss or a formal
            element of the work. The chain does not negotiate either way.
          </p>
        </Section>
      </article>

      {/* §09 — Survivors */}
      <EvidenceBlock exhibit="C · state = 1" title="The Three Survivors, and Their Claims">
        <div className="survivors-grid">
          <div className="survivor">
            <span className="survivor__id">Token 5</span>
            <div className="survivor__name">Harold</div>
            <div className="survivor__row">
              <span className="survivor__row-label">Holder since 2018</span>
              <span className="survivor__row-value">0x1af57a1a7bf346389f87ee2c9ff6bf93823ea4d0</span>
            </div>
            <div className="survivor__row">
              <span className="survivor__row-label">Claim · 2018-04-15</span>
              <span className="survivor__row-value">0x65c0c28c…</span>
            </div>
            <div className="survivor__prize">4.119 ETH</div>
            <span className="survivor__prize-note">claimed 38h after Tokenville</span>
          </div>

          <div className="survivor">
            <span className="survivor__id">Token 10</span>
            <div className="survivor__name">Danko</div>
            <div className="survivor__row">
              <span className="survivor__row-label">Holder since 2018</span>
              <span className="survivor__row-value">0x7b9db670763bc972ff2af41bbcf2431b9fafa388</span>
            </div>
            <div className="survivor__row">
              <span className="survivor__row-label">Claim · 2018-04-14</span>
              <span className="survivor__row-value">0xfbfb1bdd…</span>
            </div>
            <div className="survivor__prize">4.119 ETH</div>
            <span className="survivor__prize-note">claimed 26h after Tokenville</span>
          </div>

          <div className="survivor">
            <span className="survivor__id">Token 11</span>
            <div className="survivor__name">Lucy</div>
            <div className="survivor__row">
              <span className="survivor__row-label">Holder since 2018</span>
              <span className="survivor__row-value">0x63a9dbce75413036b2ba7da6a4a9a8e1f25c8ee3</span>
            </div>
            <div className="survivor__row">
              <span className="survivor__row-label">Claim · 2018-04-13</span>
              <span className="survivor__row-value">0x0d48e60c…</span>
            </div>
            <div className="survivor__prize">4.119 ETH</div>
            <span className="survivor__prize-note">first to claim, within hours</span>
          </div>
        </div>

        <p style={{
          fontFamily: 'var(--al)',
          fontStyle: 'italic',
          fontSize: '17px',
          color: 'var(--hist-fg-dim)',
          marginTop: '40px',
          maxWidth: '720px',
        }}>
          Each owner called <code style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--hist-coral)' }}>getGain(tokenId)</code>{' '}
          to self-claim an equal third of the prize pool. No performance
          weighting, no author intervention. None of the three tokens has
          been transferred from its post-show holder in the eight years
          since.
        </p>
      </EvidenceBlock>

      {/* Coda */}
      <p className="hist__coda">
        Everything above is verifiable against Ethereum mainnet by anyone with
        an RPC endpoint and a few hours. We have not shown you art. We have
        shown you evidence. What you call it from here is your part of the
        work.
      </p>

      {/* Appendix */}
      <section className="hist__appendix">
        <div className="hist__appendix-title">Appendix · Data & Method</div>
        <div className="hist__appendix-body">
          <p>
            RPC: <code>https://ethereum-rpc.publicnode.com</code> (public, no key).
          </p>
          <p>
            Contract creation addresses derived via RLP-encoded CREATE
            formula: <code>keccak256(rlp([sender, nonce]))[12:]</code>, computed
            for nonces 0–120 of deployer{' '}
            <code>0xb8579b19da2108249d4391d73430abba665515ca</code>.
          </p>
          <p>
            Death / revival sequence reconstructed by{' '}
            <code>eth_getLogs</code> over the{' '}
            <code>TokenState(uint256,uint8)</code> event, topic{' '}
            <code>0xcf76a3b96c0df8c1e7e7ebc3491f0fa93a335bcb18f12a49a25e5f6b858b6a25</code>.
          </p>
          <p>
            Marketplace sales reconstructed across v1 / v2 StockExchange,
            DeusMarketplace v3, OpenSea Wyvern v1 + v2, and Seaport 1.1 – 1.6.
            Total: 935 events across 6 venues. WETH-denominated Seaport
            sales parsed from <code>OrderFulfilled</code> consideration totals.
          </p>
          <p>
            Identification of the buggy v1 contract: locating the single
            DeusETH-family contract with 50{' '}
            <code>TokenHolder</code> events and zero death events.
          </p>
          <p>
            This page is a public reconstruction. Corrections are welcome.
          </p>
        </div>
      </section>

    </div>
  )
}
