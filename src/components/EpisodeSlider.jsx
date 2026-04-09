import { useState } from 'react'
import ReactSlick from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import YouTubeModal from './YouTubeModal'

const Slider = ReactSlick.default || ReactSlick

function parseMedia(str) {
  const parts = str.split(':')
  if (parts[0] === 'image') {
    return { type: 'image', src: parts.slice(1).join(':') }
  }
  if (parts[0] === 'youtube') {
    return { type: 'youtube', id: parts[1], preview: parts.slice(2).join(':') }
  }
  if (parts[0] === 'coub') {
    return { type: 'coub', id: parts[1], preview: parts.slice(2).join(':') }
  }
  return { type: 'image', src: str }
}

export default function EpisodeSlider({ media }) {
  const [videoModal, setVideoModal] = useState(null)

  const items = media.map(parseMedia)

  const settings = {
    dots: true,
    infinite: items.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: items.length > 1,
  }

  return (
    <>
      <Slider {...settings}>
        {items.map((item, i) => (
          <div key={i} className="episode__slide-wrap">
            {item.type === 'image' && (
              <img className="episode__slide" src={item.src} alt="" />
            )}
            {item.type === 'youtube' && (
              <div className="episode__video-preview" onClick={() => setVideoModal(item.id)}>
                <img src={item.preview} alt="" />
              </div>
            )}
            {item.type === 'coub' && (
              <div className="episode__video-preview" onClick={() => setVideoModal({ coub: item.id })}>
                <img src={item.preview} alt="" />
              </div>
            )}
          </div>
        ))}
      </Slider>
      {videoModal && typeof videoModal === 'string' && (
        <YouTubeModal youtubeId={videoModal} onClose={() => setVideoModal(null)} />
      )}
      {videoModal && videoModal.coub && (
        <YouTubeModal coubId={videoModal.coub} onClose={() => setVideoModal(null)} />
      )}
    </>
  )
}
