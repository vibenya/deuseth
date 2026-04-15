export function createPlayer(src, volume = 0.5, { debounce = 0 } = {}) {
  const audio = new Audio(src)
  audio.volume = volume
  let debounceTimer = null
  const pending = new Set()

  const play = (delayMs = 0) => {
    if (debounce > 0) {
      if (debounceTimer) return
      debounceTimer = setTimeout(() => { debounceTimer = null }, debounce)
    }
    const t = setTimeout(() => {
      pending.delete(t)
      const clone = audio.cloneNode()
      clone.volume = volume
      clone.play().catch(() => {})
      clone.addEventListener('ended', () => { clone.src = '' }, { once: true })
    }, delayMs)
    pending.add(t)
  }

  const cancel = () => {
    pending.forEach(clearTimeout)
    pending.clear()
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  return { play, cancel }
}
