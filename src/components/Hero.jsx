import '../styles/Hero.css'
import HeroImg from '../images/covers/hero.jpg'
import HeroHD from '../images/covers/hero-hd.jpg'
import HeroMob from '../images/covers/hero-mob.jpg'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <picture className="hero__bg">
          <source media="(max-width: 568px)" srcSet={HeroMob} />
          <source media="(max-width: 1300px)" srcSet={HeroImg} />
          <source media="(min-width: 1301px)" srcSet={HeroHD} />
          <img src={HeroImg} alt="DEUS ETH" />
        </picture>
      </div>
    </section>
  )
}
