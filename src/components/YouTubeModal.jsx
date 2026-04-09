import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../styles/Modal.css'

export default function YouTubeModal({ youtubeId, coubId, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const src = coubId
    ? `https://coub.com/embed/${coubId}?muted=false&autostart=true&originalSize=false&startWithHD=true`
    : `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`

  return createPortal(
    <div className="modal" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '90vw', maxWidth: 900 }}>
        <iframe
          className="modal__iframe"
          src={src}
          width="100%"
          height={506}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ aspectRatio: '16/9', height: 'auto' }}
        />
      </div>
      <button className="modal__close" onClick={onClose}>
        <svg viewBox="0 0 20 20" fill="#fff">
          <path d="M15.898,4.045c-0.271-0.272-0.713-0.272-0.986,0l-4.71,4.711L5.493,4.045c-0.272-0.272-0.714-0.272-0.986,0s-0.272,0.714,0,0.986l4.709,4.711l-4.71,4.711c-0.272,0.271-0.272,0.713,0,0.986c0.136,0.136,0.314,0.203,0.492,0.203c0.179,0,0.357-0.067,0.493-0.203l4.711-4.711l4.71,4.711c0.137,0.136,0.314,0.203,0.494,0.203c0.178,0,0.355-0.067,0.492-0.203c0.273-0.273,0.273-0.715,0-0.986l-4.711-4.711l4.711-4.711C16.172,4.759,16.172,4.317,15.898,4.045z" />
        </svg>
      </button>
    </div>,
    document.getElementById('modal-root')
  )
}
