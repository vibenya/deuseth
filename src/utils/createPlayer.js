export function createPlayer(src, volume = 0.5, { debounce = 0 } = {}) {
  const audio = new Audio(src)
  audio.volume = volume
  audio.preload = 'auto'
  let debounceTimer = null
  let delayTimer = null

  const play = (delayMs = 0) => {
    if (debounce > 0) {
      if (debounceTimer) return
      debounceTimer = setTimeout(() => { debounceTimer = null }, debounce)
    }
    clearTimeout(delayTimer)
    delayTimer = setTimeout(() => {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }, delayMs)
  }

  const cancel = () => {
    clearTimeout(delayTimer)
    delayTimer = null
    audio.pause()
    audio.currentTime = 0
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  return { play, cancel }
}
