import { useRef, useEffect } from 'react'
import ReactSlick from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const Slider = ReactSlick.default || ReactSlick

export default function AdvSlider({ data, episodeActive, onChangeEpisode }) {
  const sliderRef = useRef(null)
  const activeIdx = data.findIndex(ep => ep.id === episodeActive)

  useEffect(() => {
    if (sliderRef.current && activeIdx >= 0) {
      sliderRef.current.slickGoTo(Math.max(0, activeIdx - 1))
    }
  }, [activeIdx])

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 2,
    swipeToSlide: true,
    focusOnSelect: false,
    responsive: [
      { breakpoint: 600, settings: { slidesToShow: 2.5, slidesToScroll: 1 } },
      { breakpoint: 900, settings: { slidesToShow: 3.5, slidesToScroll: 2 } },
    ],
  }

  return (
    <div className="adventures__slider-wrap">
      <Slider ref={sliderRef} {...settings}>
        {data.map(ep => (
          <div key={ep.id} className="adventures__slide-cell">
            <div
              className={
                'adventures__slide' +
                (ep.id === episodeActive ? ' adventures__slide--active' : '') +
                (ep.disabled ? ' adventures__slide--disabled' : '')
              }
              onClick={() => !ep.disabled && onChangeEpisode(ep.id)}
            >
              <img className="adventures__slide-img" src={ep.slide} alt={ep.title} />
              <div className="adventures__slide-label">{ep.number}</div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}
