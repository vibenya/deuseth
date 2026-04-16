import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles/StoryWindow.css'

export default function StoryWindow({ children, onClose }) {
  const [el] = useState(() => document.createElement('div'))

  useEffect(() => {
    const modalRoot = document.getElementById('modal-root')
    modalRoot.appendChild(el)
    document.body.style.overflow = 'hidden'

    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)

    return () => {
      modalRoot.removeChild(el)
      document.body.style.overflow = 'auto'
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose, el])

  return createPortal(children, el)
}
