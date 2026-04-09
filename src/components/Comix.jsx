import '../styles/Comix.css'
import comixLeft from '../images/comix-left.jpg'
import comixRight from '../images/comix-right.jpg'
import comixTop from '../images/comix-top.png'
import comixBottom from '../images/comix-bottom.jpg'
import comixMulti from '../images/comix-multi.jpg'

export default function Comix() {
  return (
    <section className="comix">
      <div className="comix__img comix__img--left">
        <div className="comix__imgwrap">
          <img src={comixLeft} alt="" />
        </div>
        <div className="comix__imgwrap comix__imgwrap--hide">
          <img src={comixBottom} alt="" />
        </div>
      </div>
      <div className="comix__inner">
        <div className="comix__text">
          <div className="comix__imgwrap">
            <img className="comix__tokenpic" src={comixTop} alt="" />
          </div>
          <h2 className="comix__title">Unique collectible tokens</h2>
          <p className="comix__para">
            Each of the 50 characters is a unique ERC-721 token with its own story,
            traits, and destiny determined by blockchain events.
          </p>
          <div className="comix__imgwrap">
            <img className="comix__tokenpic comix__tokenpic--hide" src={comixMulti} alt="" />
          </div>
        </div>
      </div>
      <div className="comix__img comix__img--right">
        <div className="comix__imgwrap">
          <img src={comixRight} alt="" />
        </div>
      </div>
    </section>
  )
}
