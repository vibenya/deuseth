import '../styles/Featured.css'
import featFl from '../images/feat_fl.png'
import featCn from '../images/feat_cn.png'
import featBn from '../images/feat_bn.png'
import featCt from '../images/feat_ct.png'

const press = [
  { img: featFl, alt: 'Freelancer', href: 'https://www.freelancer.com/articles/web-development/deus-eth' },
  { img: featCn, alt: 'CoinDesk', href: 'https://www.coindesk.com/' },
  { img: featBn, alt: 'Benzinga', href: 'https://www.benzinga.com/' },
  { img: featCt, alt: 'Cointelegraph', href: 'https://cointelegraph.com/' }
]

export default function Featured() {
  return (
    <section className="featured">
      <div className="featured__title">Featured on</div>
      <div className="featured__inner">
        {press.map((p, i) => (
          <a key={i} className="featured__link" href={p.href} target="_blank" rel="noopener noreferrer">
            <img src={p.img} alt={p.alt} />
          </a>
        ))}
      </div>
    </section>
  )
}
