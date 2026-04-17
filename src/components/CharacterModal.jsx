import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import timelines from '../data/token_timelines.json'
import '../styles/CharacterModal.css'

const ETHERSCAN_TX      = 'https://etherscan.io/tx/'
const ETHERSCAN_ADDRESS = 'https://etherscan.io/address/'

function shortAddr(a) {
  if (!a || typeof a !== 'string' || a.length < 12) return a
  return a.slice(0, 6) + '…' + a.slice(-4)
}

function AddressLink({ address, title }) {
  if (!address) return null
  return (
    <a
      className="cm-addr"
      href={`${ETHERSCAN_ADDRESS}${address}`}
      target="_blank"
      rel="noopener noreferrer"
      title={title || address}
      onClick={(evt) => evt.stopPropagation()}
    >
      {shortAddr(address)}
    </a>
  )
}

function EthIcon({ className = 'cm-eth' }) {
  // Classic Ethereum diamond, two-tone for volume
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <g fillRule="evenodd">
        <polygon fill="currentColor" opacity="0.6"  points="16,4 16,12.87 23.95,16.42" />
        <polygon fill="currentColor"                points="16,4 8.05,16.42 16,12.87" />
        <polygon fill="currentColor" opacity="0.6"  points="16,21.97 16,28 23.96,17.9" />
        <polygon fill="currentColor"                points="16,28 16,21.97 8.05,17.9" />
        <polygon fill="currentColor" opacity="0.45" points="16,20.57 23.95,16.42 16,12.88" />
        <polygon fill="currentColor" opacity="0.8"  points="8.05,16.42 16,20.57 16,12.88" />
      </g>
    </svg>
  )
}

const STATUS_LABEL = {
  alive: 'Alive',
  'died-now': 'Just Fallen',
  dead: 'Fallen',
  reborn: 'Reborn',
  reviving: 'Reborn',
  'dying-settled': 'Fallen',
  dying: 'Just Fallen',
}

function formatPrice(p) {
  if (p == null) return null
  if (p >= 100) return p.toFixed(0)
  if (p >= 1) return p.toFixed(2)
  return p.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function normalizeStatus(s) {
  if (s === 'dying' || s === 'died-now') return 'died-now'
  if (s === 'dying-settled' || s === 'dead') return 'dead'
  if (s === 'reviving' || s === 'reborn') return 'reborn'
  return 'alive'
}

const BURN_ADDRS = new Set([
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead',
])

function computeLedgerSummary(events) {
  let sales = 0
  let ransom = 0
  let ransomUsd = 0
  const masters = new Set()

  for (const e of events) {
    if (e.type === 'mint') {
      if (e.to && !BURN_ADDRS.has(e.to.toLowerCase())) masters.add(e.to.toLowerCase())
      if (e.price) {
        sales++
        ransom += e.price
        if (e.price_usd) ransomUsd += e.price_usd
      }
    } else if (e.type === 'sale') {
      sales++
      if (e.buyer && !BURN_ADDRS.has(e.buyer.toLowerCase())) masters.add(e.buyer.toLowerCase())
      if (e.price) ransom += e.price
      if (e.price_usd) ransomUsd += e.price_usd
    } else if (e.type === 'transfer') {
      if (e.to && !BURN_ADDRS.has(e.to.toLowerCase())) masters.add(e.to.toLowerCase())
    }
  }

  return { sales, masters: masters.size, ransom, ransomUsd }
}

function getFinale(stats) {
  if (!stats) return null
  if (stats.final_status === 'winner') {
    return { kind: 'winner', text: 'Reached Tokenville — held by master' }
  }
  if (stats.final_status === 'dead') {
    const ep = stats.died_in_episode != null ? String(stats.died_in_episode).padStart(2, '0') : null
    const title = stats.died_in_episode_title
    const parts = ['Freed by fate']
    if (ep) parts.push(`Ep. ${ep}`)
    if (title) parts.push(`«${title}»`)
    return { kind: 'fallen', text: parts.join(' · ') }
  }
  return { kind: 'alive', text: 'Still in chains' }
}

export default function CharacterModal({ character, status, episode, onClose }) {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState('identity')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const t = requestAnimationFrame(() => setMounted(true))
    return () => {
      document.removeEventListener('keydown', onKey)
      cancelAnimationFrame(t)
    }
  }, [onClose])

  const timeline = character ? timelines[character.id] : null
  const stats = timeline?.stats
  const events = useMemo(() => {
    const base = (timeline?.timeline || []).filter(
      e => e.type === 'mint' || e.type === 'sale' || e.type === 'transfer'
        || e.type === 'burn' || e.type === 'death' || e.type === 'revival'
        || e.type === 'prize'
    )
    if (stats?.final_status === 'winner') {
      // Insert after last event dated on or before Tokenville (2018-04-13)
      const winEvent = { type: 'winner', date: '2018-04-13', note: stats?.final_status_note }
      let insertAt = base.length
      for (let i = 0; i < base.length; i++) {
        if ((base[i].date || '') > '2018-04-13') { insertAt = i; break }
      }
      base.splice(insertAt, 0, winEvent)
    }
    return base
  }, [timeline, stats])

  const obit = character && episode?.obits?.[character.id]
  const story = character && episode?.characterStories?.[character.id]
  const episodeContent = obit || story
  const episodeKind = obit ? 'obituary' : (story ? 'story' : null)

  // Default to episode tab if this episode has something for the character
  // Reset tab when character/episode changes
  useEffect(() => {
    setTab(episodeContent ? 'episode' : 'identity') // eslint-disable-line react-hooks/set-state-in-effect
  }, [character?.id, episode?.id, episodeContent])

  if (!character) return null

  const normStatus = normalizeStatus(status)
  const statusText = STATUS_LABEL[status] || STATUS_LABEL[normStatus] || 'Alive'

  const epNumber = episode?.number != null ? String(episode.number).padStart(2, '0') : null
  const epTitle = episode?.title

  return createPortal(
    <div
      className={`cm-overlay${mounted ? ' cm-overlay--in' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <aside
        className={`cm-panel cm-panel--${normStatus}${mounted ? ' cm-panel--in' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button className="cm-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"/>
          </svg>
        </button>

        {/* ===== FULL SCROLL CONTAINER ===== */}
        <div className="cm-scroll">

        {/* ===== HERO STAGE ===== */}
        <header className="cm-stage">
          <div className="cm-stage__backdrop" aria-hidden="true">
            <div className="cm-stage__spot" />
            <div className="cm-stage__grid" />
          </div>

          <div className="cm-stage__id">
            <span className="cm-stage__token">№ {String(character.id).padStart(3, '0')}</span>
          </div>

          <div className="cm-stage__figure-wrap">
            <div className="cm-stage__pedestal" aria-hidden="true" />
            <img
              src={character.preview.replace('/images/characters/outlined_', '/images/characters/full/full_')}
              alt={character.name}
              className="cm-stage__figure"
              draggable="false"
            />
          </div>

          <h2 className="cm-stage__name">{character.name}</h2>

          <div className="cm-stage__status-row">
            {normStatus !== 'alive' && (
              <span className={`cm-status cm-status--${normStatus}`}>
                <span className="cm-status__dot" aria-hidden="true" />
                {statusText}
              </span>
            )}
            {epNumber && (
              <span className="cm-stage__episode-tag" title={epTitle}>
                <span className="cm-stage__episode-label">Ep.</span>
                <span className="cm-stage__episode-num">{epNumber}</span>
              </span>
            )}
          </div>
        </header>

        {/* ===== TABS ===== */}
        {episodeContent && (
          <div className="cm-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'identity'}
              className={`cm-tab${tab === 'identity' ? ' cm-tab--active' : ''}`}
              onClick={() => setTab('identity')}
            >
              Identity
            </button>
            <button
              role="tab"
              aria-selected={tab === 'episode'}
              className={`cm-tab${tab === 'episode' ? ' cm-tab--active' : ''}`}
              onClick={() => setTab('episode')}
            >
              {episodeKind === 'obituary' ? 'Obituary' : 'In This Episode'}
            </button>
            <span className={`cm-tabs__ink cm-tabs__ink--${tab}`} aria-hidden="true" />
          </div>
        )}

        {/* ===== BODY ===== */}
        <div className="cm-body">

          {/* IDENTITY */}
          <section
            className="cm-pane"
            hidden={tab !== 'identity'}
            aria-hidden={tab !== 'identity'}
          >
            {character.bio && (
              <p className="cm-bio">{character.bio}</p>
            )}

            {events.length > 0 && (() => {
              const summary = computeLedgerSummary(events)
              const finale = getFinale(stats)
              const hasStats = summary.sales > 0 || summary.masters > 0 || summary.ransom > 0
              return (
              <div className="cm-provenance">
                <h3 className="cm-section-title">
                  <span className="cm-section-title__rule" />
                  <span className="cm-section-title__text">Ledger of Chains</span>
                  <span className="cm-section-title__rule" />
                </h3>
                {(hasStats || finale) && (
                  <div className="cm-summary">
                    {hasStats && (
                      <div className="cm-summary__stats">
                        <span>Sold <b>{summary.sales}×</b></span>
                        <span aria-hidden="true" className="cm-summary__sep">·</span>
                        <span><b>{summary.masters}</b> {summary.masters === 1 ? 'master' : 'masters'}</span>
                        {summary.ransom > 0 && (
                          <>
                            <span aria-hidden="true" className="cm-summary__sep">·</span>
                            <span>
                              paid <b><EthIcon /> {formatPrice(summary.ransom)}</b>
                              {summary.ransomUsd > 0 && (
                                <span className="cm-summary__usd"> (≈${summary.ransomUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })})</span>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {finale && (
                      <div className={`cm-summary__finale cm-summary__finale--${finale.kind}`}>
                        {finale.text}
                      </div>
                    )}
                  </div>
                )}
                <ol className="cm-events">
                  {events.map((e, i) => (
                    <li key={i} className={`cm-event cm-event--${e.type}`}>
                      <span className="cm-event__marker" aria-hidden="true" />
                      <span className="cm-event__date">{e.date}</span>
                      <span className="cm-event__body">
                        {e.type === 'mint' && e.version === 'v3' && (
                          <>Recast as ERC-721 — returned to the master
                            {e.to && (
                              <> · <AddressLink address={e.to} title={`Airdropped to ${e.to}`} /></>
                            )}
                          </>
                        )}
                        {e.type === 'mint' && e.version !== 'v3' && (
                          <>Forged on <b>{e.version}</b>
                            {e.price != null && <> — sold for <b><EthIcon /> {formatPrice(e.price)}</b></>}
                            {e.price_usd != null && <> <span className="cm-event__usd" title={`ETH/USD ${e.eth_usd_rate}`}>(≈${e.price_usd.toLocaleString('en-US', {maximumFractionDigits: 0})})</span></>}
                            {e.to && (
                              <> · <AddressLink address={e.to} title={`First master ${e.to}`} /></>
                            )}
                          </>
                        )}
                        {e.type === 'sale' && (
                          <>Bought again for <b><EthIcon /> {formatPrice(e.price)}</b>
                            {e.price_usd != null && <> <span className="cm-event__usd" title={`ETH/USD ${e.eth_usd_rate}`}>(≈${e.price_usd.toLocaleString('en-US', {maximumFractionDigits: 0})})</span></>}
                            {(e.seller || e.buyer) && (
                              <> · <AddressLink address={e.seller} title={`Old master ${e.seller}`} /> <span className="cm-addr-arrow">→</span> <AddressLink address={e.buyer} title={`New master ${e.buyer}`} /></>
                            )}
                          </>
                        )}
                        {e.type === 'transfer' && (
                          <>Handed to a new master ·{' '}
                            <AddressLink address={e.from} title={`From ${e.from}`} />
                            <span className="cm-addr-arrow"> → </span>
                            <AddressLink address={e.to} title={`To ${e.to}`} />
                          </>
                        )}
                        {e.type === 'burn' && <>Committed to the burn address</>}
                        {e.type === 'death' && (
                          <>Freed by the Smart Contract in <b>{e.episode_title}</b>{e.block != null && <> · block <b>{e.block.toLocaleString()}</b></>}</>
                        )}
                        {e.type === 'revival' && (
                          <>Dragged back into the chain in <b>{e.episode_title}</b>{e.block != null && <> · block <b>{e.block.toLocaleString()}</b></>}</>
                        )}
                        {e.type === 'winner' && (
                          <><span className="cm-event__crown" aria-hidden="true">👑</span> Three remained — Tokenville reached</>
                        )}
                        {e.type === 'prize' && (
                          <>Prize claimed by the master · <b><EthIcon /> {formatPrice(e.amount)}</b>
                            {e.amount_usd != null && <> <span className="cm-event__usd" title={`ETH/USD ${e.eth_usd_rate}`}>(≈${e.amount_usd.toLocaleString('en-US', {maximumFractionDigits: 0})})</span></>}
                            {e.to && <> · <AddressLink address={e.to} title={`Paid to ${e.to}`} /></>}
                          </>
                        )}
                      </span>
                      {e.tx && (
                        <a
                          className="cm-event__link"
                          href={`${ETHERSCAN_TX}${e.tx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Etherscan"
                          onClick={evt => evt.stopPropagation()}
                          aria-label="View on Etherscan"
                        >
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M5 3h8v8M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </a>
                      )}
                      {!e.tx && (
                        <span style={{ width: 22 }} aria-hidden="true" />
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              )
            })()}
          </section>

          {/* EPISODE */}
          {episodeContent && (
            <section
              className="cm-pane"
              hidden={tab !== 'episode'}
              aria-hidden={tab !== 'episode'}
            >
              <div className="cm-episode-head">
                {episodeKind === 'obituary' && (
                  <span className="cm-kind cm-kind--obituary">Obituary</span>
                )}
                {epTitle && (
                  <h3 className="cm-episode-title">
                    {epNumber && <span className="cm-episode-title__num">Ep. {epNumber}</span>}
                    <span className="cm-episode-title__text">{epTitle}</span>
                  </h3>
                )}
              </div>

              {episodeContent.image && (
                <figure className="cm-episode-figure">
                  <img src={episodeContent.image} alt="" />
                  <div className="cm-episode-figure__frame" aria-hidden="true" />
                </figure>
              )}

              {episodeContent.text && (
                <p className={`cm-episode-text cm-episode-text--${episodeKind}`}>
                  {episodeContent.text}
                </p>
              )}
            </section>
          )}

        </div>

        </div>{/* cm-scroll */}
      </aside>
    </div>,
    document.body
  )
}
