import { useEffect } from 'react'
import timelines from '../data/token_timelines.json'
import '../styles/Modal.css'
import '../styles/CharacterModal.css'

const ETHERSCAN_TX = 'https://etherscan.io/tx/'

const VENUE_LABEL = {
  'StockExchange': 'stock',
  'DeusMarketplace': 'market',
  'Wyvern v1': 'OpenSea (Wyvern)',
  'Wyvern v2': 'OpenSea (Wyvern v2)',
  'Seaport 1.1': 'OpenSea (Seaport)',
  'Seaport 1.4': 'OpenSea (Seaport)',
  'Seaport 1.5': 'OpenSea (Seaport)',
  'Seaport 1.6': 'OpenSea (Seaport)',
}

function formatPrice(p) {
  if (p == null) return null
  if (p >= 100) return p.toFixed(0)
  if (p >= 1) return p.toFixed(2)
  return p.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

export default function CharacterModal({ character, status, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!character) return null

  const statusLabel = {
    alive: 'Alive',
    'died-now': 'Died This Episode',
    dead: 'Fallen',
    reborn: 'Reborn',
  }

  const timeline = timelines[character.id]
  const stats = timeline?.stats

  // Only meaningful events: mint, sale, burn. Skip transfers/lists/delists in UI.
  const events = (timeline?.timeline || []).filter(
    e => e.type === 'mint' || e.type === 'sale' || e.type === 'burn'
  )

  return (
    <div className="modal char-modal" onClick={onClose}>
      <div className="modal__content char-modal__content" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <svg viewBox="0 0 20 20" fill="#fff"><path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z"/></svg>
        </button>
        <div className="char-modal__hero">
          <img src={character.preview} alt={character.name} className="char-modal__img" />
        </div>
        <h3>{character.name}</h3>
        <span className={`char-modal__status char-modal__status--${status}`}>
          {statusLabel[status] || status}
        </span>

        {stats && stats.total_sales > 0 && (
          <div className="char-modal__stats">
            <span className="char-modal__stat">
              <b>{stats.total_sales}</b> sale{stats.total_sales > 1 ? 's' : ''}
            </span>
            <span className="char-modal__stat">
              high <b>Ξ {formatPrice(stats.highest_sale)}</b>
            </span>
            {stats.last_sale != null && (
              <span className="char-modal__stat">
                last <b>Ξ {formatPrice(stats.last_sale)}</b>
              </span>
            )}
          </div>
        )}

        <p className="char-modal__bio">{character.bio}</p>

        {events.length > 0 && (
          <div className="char-modal__timeline">
            <div className="char-modal__timeline-title">Provenance</div>
            <ol className="char-modal__timeline-list">
              {events.map((e, i) => (
                <li key={i} className={`char-modal__event char-modal__event--${e.type}`}>
                  <span className="char-modal__event-date">{e.date}</span>
                  <span className="char-modal__event-body">
                    {e.type === 'mint' && (
                      <>Minted on <b>{e.version}</b>{e.price != null && <> for <b>Ξ {formatPrice(e.price)}</b></>}</>
                    )}
                    {e.type === 'sale' && (
                      <>Sold for <b>Ξ {formatPrice(e.price)}</b>{' '}
                      <span className="char-modal__event-venue">{VENUE_LABEL[e.venue] || e.venue}</span></>
                    )}
                    {e.type === 'burn' && <>Sent to burn address ⚰️</>}
                  </span>
                  <a
                    className="char-modal__event-link"
                    href={`${ETHERSCAN_TX}${e.tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Etherscan"
                    onClick={evt => evt.stopPropagation()}
                  >↗</a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
