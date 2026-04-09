import { Link } from 'react-router-dom'
import Feature from './Feature'
import '../styles/Intro.css'

const features = [
  { id: 1, url: './images/scheme_x50.png', title: '50 TOKENS', text: '50 tokenized characters were sold to begin the race for survival.' },
  { id: 2, url: './images/scheme_x47.png', title: '47 DEATHS IN 10 EPISODES', text: 'A sequence of smart contract events determined who was to continue the journey and who had to die.' },
  { id: 3, url: './images/scheme_x3.png', title: '3 WINNERS', text: '3 characters survived and shared the box office.' }
]

export default function Intro() {
  return (
    <section className="intro">
      <div className="intro__inner">
        <h2 className="intro__title">Blockchain as a storyteller</h2>
        <p className="intro__para">
          Deus ETH is the world's first tokenized adventure — a story told by blockchain events.
          50 characters were tokenized and sold as ERC-721 tokens. A sequence of smart contract
          events determined each character's fate across 10 episodes.
        </p>
        <div className="intro__features">
          {features.map(f => (
            <Feature key={f.id} url={f.url} title={f.title} text={f.text} />
          ))}
        </div>
        <Link className="intro__btn btn" to="/faq">Learn More</Link>
      </div>
    </section>
  )
}
