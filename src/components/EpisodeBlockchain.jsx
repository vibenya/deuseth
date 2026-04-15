import '../styles/EpisodeBlockchain.css'

const ETHERSCAN_TX    = 'https://etherscan.io/tx/'
const ETHERSCAN_BLOCK = 'https://etherscan.io/block/'

function formatUTC(iso) {
  if (!iso) return null
  // e.g. "2018-03-16T15:37:22Z" → "16 Mar 2018, 15:37:22 UTC"
  const d = new Date(iso)
  return d.toUTCString().replace('GMT', 'UTC')
}

function shortTx(tx) {
  if (!tx || tx.length < 14) return tx
  return tx.slice(0, 10) + '…' + tx.slice(-6)
}

function RosterList({ items }) {
  return (
    <ul className="ep-chain__roster">
      {items.map((it) => (
        <li key={it.token_id} className="ep-chain__roster-item">
          <span className="ep-chain__roster-name">{it.name}</span>
          <span className="ep-chain__roster-id">#{String(it.token_id).padStart(3, '0')}</span>
        </li>
      ))}
    </ul>
  )
}

export default function EpisodeBlockchain({ blockchain }) {
  if (!blockchain) return null

  const {
    note,
    first_block,
    first_event,
    deaths,
    revivals,
    winners,
    winners_note,
    finalists,
    finalists_note,
    alive_before_hard_fork,
  } = blockchain

  // Redrum: note only
  if (note) {
    return (
      <div className="ep-chain">
        <div className="ep-chain__header">
          <span className="ep-chain__icon" aria-hidden="true">⬡</span>
          <span className="ep-chain__title">Blockchain Record</span>
        </div>
        <p className="ep-chain__note">{note}</p>
      </div>
    )
  }

  const events = revivals || deaths || []
  const isRevival = !!revivals
  const firstEvent = events[0]

  // Finale (Tokenville): winners-only — no deaths/revivals header counts
  const headerTitle = winners ? 'Final On-Chain State' : 'On-Chain Proof'
  const headerCount =
    winners
      ? `${winners.length} winners`
      : events.length > 1
        ? `${events.length} ${isRevival ? 'revivals' : 'deaths'}`
        : null

  return (
    <div className={`ep-chain${winners ? ' ep-chain--winners' : ''}`}>
      <div className="ep-chain__header">
        <span className="ep-chain__icon" aria-hidden="true">⬡</span>
        <span className="ep-chain__title">{headerTitle}</span>
        {headerCount && (
          <span className="ep-chain__count">{headerCount}</span>
        )}
      </div>

      <dl className="ep-chain__grid">
        {first_event && (
          <div className="ep-chain__row">
            <dt>First event</dt>
            <dd>{formatUTC(first_event)}</dd>
          </div>
        )}
        {first_block && (
          <div className="ep-chain__row">
            <dt>Block</dt>
            <dd>
              <a
                className="ep-chain__link"
                href={`${ETHERSCAN_BLOCK}${first_block}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                #{first_block.toLocaleString()}
                <svg className="ep-chain__ext" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M4 2h6v6M10 2L2 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </a>
            </dd>
          </div>
        )}
        {firstEvent?.tx && (
          <div className="ep-chain__row">
            <dt>{isRevival ? 'First revival tx' : 'First death tx'}</dt>
            <dd>
              <a
                className="ep-chain__link ep-chain__link--tx"
                href={`${ETHERSCAN_TX}${firstEvent.tx}`}
                target="_blank"
                rel="noopener noreferrer"
                title={firstEvent.tx}
              >
                {shortTx(firstEvent.tx)}
                <svg className="ep-chain__ext" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M4 2h6v6M10 2L2 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </a>
            </dd>
          </div>
        )}
      </dl>

      {/* Hard Fork: sole survivor */}
      {alive_before_hard_fork && alive_before_hard_fork.length > 0 && (
        <div className="ep-chain__aside ep-chain__aside--survivor">
          <div className="ep-chain__aside-head">
            <span className="ep-chain__aside-dot" aria-hidden="true" />
            <span className="ep-chain__aside-title">Sole survivor before revival</span>
          </div>
          {alive_before_hard_fork.map((s) => (
            <div key={s.token_id} className="ep-chain__survivor" title={s.note || ''}>
              <span className="ep-chain__survivor-name">{s.name}</span>
              <span className="ep-chain__survivor-id">#{String(s.token_id).padStart(3, '0')}</span>
              {s.note && (
                <p className="ep-chain__aside-note">{s.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tokencide: 5 finalists */}
      {finalists && finalists.length > 0 && (
        <div className="ep-chain__aside ep-chain__aside--finalists">
          <div className="ep-chain__aside-head">
            <span className="ep-chain__aside-dot" aria-hidden="true" />
            <span className="ep-chain__aside-title">{finalists.length} Finalists</span>
          </div>
          <RosterList items={finalists} />
          {finalists_note && (
            <p className="ep-chain__aside-note">{finalists_note}</p>
          )}
        </div>
      )}

      {/* Tokenville: 3 canonical winners */}
      {winners && winners.length > 0 && (
        <div className="ep-chain__aside ep-chain__aside--winners">
          <div className="ep-chain__aside-head">
            <span className="ep-chain__aside-dot" aria-hidden="true">👑</span>
            <span className="ep-chain__aside-title">{winners.length} Winners</span>
          </div>
          <RosterList items={winners} />
          {winners_note && (
            <p className="ep-chain__aside-note">{winners_note}</p>
          )}
        </div>
      )}
    </div>
  )
}
