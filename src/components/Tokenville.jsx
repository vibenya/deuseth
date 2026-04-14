import { useEffect, useRef, useState } from 'react'
import '../styles/Tokenville.css'
import TeamChat from './TeamChat'

const SCRIPT = [
  // — Тишина — [0..7]
  { speaker: 5,    text: "Тихо.",                                           pause_after_ms: 1500 },
  { speaker: 10,   text: "Да.",                                             pause_after_ms: 1500 },
  { speaker: 5,    text: "Раньше не было так тихо.",                        pause_after_ms: 1500 },
  { speaker: 11,   text: "Раньше всегда что-то происходило.",               pause_after_ms: 2000 },
  { speaker: 5,    text: "А теперь?",                                       pause_after_ms: 2000 },
  { speaker: 10,   text: "Ничего.",                                         pause_after_ms: 1500 },
  { speaker: 5,    text: "Хорошо?",                                         pause_after_ms: 1500 },
  { speaker: 11,   text: "Непривычно.",                                     pause_after_ms: 2500 },

  // — Титр 1 — [8]
  { speaker: null, text: "DeusETH. Сезон первый.",                          pause_after_ms: 3000 },

  // — Стоять — [9..24]
  { speaker: 5,    text: "Что мы делаем?",                                  pause_after_ms: 1500 },
  { speaker: 11,   text: "Стоим.",                                          pause_after_ms: 1500 },
  { speaker: 5,    text: "Долго ещё?",                                      pause_after_ms: 1500 },
  { speaker: 11,   text: "Не знаю.",                                        pause_after_ms: 1500 },
  { speaker: 10,   text: "Можно было бы сесть.",                            pause_after_ms: 1500 },
  { speaker: 5,    text: "Где?",                                            pause_after_ms: 2000 },
  { speaker: 10,   text: "Да. Сесть негде.",                                pause_after_ms: 2500 },
  { speaker: 11,   text: "Я живая.",                                        pause_after_ms: 1500 },
  { speaker: 5,    text: "Я тоже.",                                         pause_after_ms: 1500 },
  { speaker: 11,   text: "Это странно.",                                    pause_after_ms: 1500 },
  { speaker: 5,    text: "Что?",                                            pause_after_ms: 1500 },
  { speaker: 11,   text: "Быть живой. Раньше я никогда об этом не думала.", pause_after_ms: 1500 },
  { speaker: 10,   text: "О чём?",                                          pause_after_ms: 1500 },
  { speaker: 11,   text: "О том, что я живая.",                             pause_after_ms: 2000 },
  { speaker: 10,   text: "И что?",                                          pause_after_ms: 1500 },
  { speaker: 11,   text: "Ничего. Просто живая.",                           pause_after_ms: 3000 },

  // — Титр 2 — [25..26]
  { speaker: null, text: "Создано в 2017–2018.",                            pause_after_ms: 1500 },
  { speaker: null, text: "50 токенов. 10 эпизодов.",                        pause_after_ms: 3000 },

  // — Взгляды — [27..33]
  { speaker: 5,    text: "Мне кажется, на нас кто-то смотрит.",             pause_after_ms: 1500 },
  { speaker: 11,   text: "Да.",                                             pause_after_ms: 1500 },
  { speaker: 5,    text: "Ты тоже чувствуешь?",                            pause_after_ms: 1500 },
  { speaker: 11,   text: "С самого начала.",                                pause_after_ms: 1500 },
  { speaker: 10,   text: "Я тоже.",                                         pause_after_ms: 2000 },
  { speaker: 5,    text: "Это нормально?",                                  pause_after_ms: 1500 },
  { speaker: 10,   text: "Не знаю. Но мне нравится.",                      pause_after_ms: 3000 },

  // — Титр 3 — [34]
  { speaker: null, text: "Погибло 47 токенов.",                             pause_after_ms: 3000 },

  // — Свобода — [35..46]
  { speaker: 11,   text: "А чем вы теперь займётесь?",                     pause_after_ms: 1500 },
  { speaker: 5,    text: "Побегаю. Просто так.",                            pause_after_ms: 1500 },
  { speaker: 10,   text: "Поищу что-нибудь.",                              pause_after_ms: 1500 },
  { speaker: 11,   text: "Что?",                                            pause_after_ms: 1500 },
  { speaker: 10,   text: "Не знаю. Что-нибудь.",                           pause_after_ms: 2000 },
  { speaker: 5,    text: "А ты?",                                           pause_after_ms: 1500 },
  { speaker: 11,   text: "Первый раз не знаю.",                             pause_after_ms: 1500 },
  { speaker: 5,    text: "Раньше знала?",                                   pause_after_ms: 1500 },
  { speaker: 11,   text: "Раньше надо было выживать. Это понятно.",         pause_after_ms: 2000 },
  { speaker: 5,    text: "А сейчас непонятно.",                             pause_after_ms: 1500 },
  { speaker: 11,   text: "Да.",                                             pause_after_ms: 1500 },
  { speaker: 5,    text: "Мне нравится непонятно.",                         pause_after_ms: 3500 },

  // — Титр 4 — [47]
  { speaker: null, text: "Спасибо всем, кто держал токен.",                 pause_after_ms: 3000 },

  // — Зрители — [48..56]
  { speaker: 11,   text: "Как думаете, они ещё смотрят?",                  pause_after_ms: 1500 },
  { speaker: 5,    text: "Кто?",                                            pause_after_ms: 1000 },
  { speaker: 11,   text: "Те, кто смотрел.",                               pause_after_ms: 1500 },
  { speaker: 10,   text: "Некоторые — да.",                                 pause_after_ms: 1500 },
  { speaker: 5,    text: "Откуда ты знаешь?",                              pause_after_ms: 1000 },
  { speaker: 10,   text: "Чувствую.",                                       pause_after_ms: 2500 },
  { speaker: 11,   text: "Привет.",                                         pause_after_ms: 2000 },
  { speaker: 5,    text: "Привет.",                                         pause_after_ms: 2000 },
  { speaker: 10,   text: "Привет.",                                         pause_after_ms: 4000 },

  // — Финальные титры — [57..58]
  { speaker: null, text: "Always for some.",                                pause_after_ms: 2000 },
  { speaker: null, text: "But never for all.",                              pause_after_ms: 5000 },

  // — Петля (LOOP_START_INDEX = 59) —
  { speaker: 5,    text: "Ладно. А всё-таки — чем займёмся?",              pause_after_ms: 1500 },
  { speaker: 11,   text: "Побегаешь. Я поищу. Данко приготовит.",          pause_after_ms: 1500 },
  { speaker: 10,   text: "Я не умею готовить.",                            pause_after_ms: 1000 },
  { speaker: 11,   text: "Ты только что сказал, что поищет.",              pause_after_ms: 1000 },
  { speaker: 10,   text: "Я передумал.",                                   pause_after_ms: 1500 },
  { speaker: 5,    text: "Может, просто поговорим?",                       pause_after_ms: 1500 },
  { speaker: 11,   text: "О чём?",                                         pause_after_ms: 1000 },
  { speaker: 5,    text: "Не знаю. О том, как себя чувствуем.",            pause_after_ms: 1500 },
  { speaker: 11,   text: "Я чувствую, что на нас кто-то смотрит.",         pause_after_ms: 1500 },
  { speaker: 5,    text: "Я тоже.",                                        pause_after_ms: 1500 },
  { speaker: 10,   text: "Мне нравится.",                                  pause_after_ms: 5000 },
  // → loop back to index 59
]

const LOOP_START_INDEX = 59

const CHARACTERS = [
  { id: 5,  name: 'Harold', image: '/images/characters/outlined_harold.png' },
  { id: 10, name: 'Danko',  image: '/images/characters/outlined_danko.png' },
  { id: 11, name: 'Lucy',   image: '/images/characters/outlined_lucy.png' },
]

function readingTime(text) {
  if (!text) return 1800
  const ms = Math.max(1800, text.length * 60)
  return ms
}

export default function Tokenville({ embedded = false, onSlideChange }) {
  // 'chat' → TeamChat scene, 'stage' → character stage
  const [scene, setScene] = useState('chat')

  const [aliveIds, setAliveIds] = useState(new Set([5, 10, 11]))
  const [dyingIds, setDyingIds] = useState(new Set())
  // Active speaker id (or null)
  const [activeSpeaker, setActiveSpeaker] = useState(null)
  // Current bubble text
  const [bubble, setBubble] = useState(null)
  // Current credit text
  const [credit, setCredit] = useState(null)
  // Credit key for re-triggering animation
  const [creditKey, setCreditKey] = useState(0)
  // Intro appeared
  const [appeared, setAppeared] = useState(false)

  const stepRef = useRef(0)
  const cancelRef = useRef(null)

  // Schedule a callback after `ms`, storing cancel handle
  function schedule(fn, ms) {
    const t = setTimeout(fn, ms)
    cancelRef.current = t
    return t
  }

  function runStep(index) {
    const step = SCRIPT[index]

    // Handle credit (speaker === null)
    if (step.speaker === null) {
      setActiveSpeaker(null)
      setBubble(null)
      setCredit(step.text)
      setCreditKey(k => k + 1)

      const holdTime = step.pause_after_ms
      schedule(() => {
        setCredit(null)
        schedule(() => {
          const nextIndex = index + 1 >= SCRIPT.length ? LOOP_START_INDEX : index + 1
          stepRef.current = nextIndex
          runStep(nextIndex)
        }, 400)
      }, holdTime)
      return
    }

    // Normal speech line
    setActiveSpeaker(step.speaker)
    setBubble(step.text)
    setCredit(null)

    const tRead = readingTime(step.text)
    schedule(() => {
      // Fade out bubble
      setBubble(null)
      schedule(() => {
        setActiveSpeaker(null)
        schedule(() => {
          const nextIndex = index + 1 >= SCRIPT.length ? LOOP_START_INDEX : index + 1
          stepRef.current = nextIndex
          runStep(nextIndex)
        }, step.pause_after_ms)
      }, 200)
    }, tRead)
  }

  // Start stage when chat completes
  function handleChatComplete() {
    setScene('stage')
  }

  useEffect(() => {
    if (scene !== 'stage') return

    // Audio fade-in
    const audio = document.getElementById('tokenville-audio')
    if (audio) {
      audio.volume = 0
      audio.play().catch(() => {})
      let vol = 0
      const fadeInterval = setInterval(() => {
        vol = Math.min(vol + 0.4 / 30, 0.4)
        audio.volume = vol
        if (vol >= 0.4) clearInterval(fadeInterval)
      }, 100)
    }

    // Appear animation delay, then start script
    setAppeared(true)
    const t = setTimeout(() => {
      runStep(0)
    }, 2000)

    return () => {
      clearTimeout(t)
      if (cancelRef.current) clearTimeout(cancelRef.current)
    }
  }, [scene])

  const visibleChars = CHARACTERS.filter(c => aliveIds.has(c.id))

  if (scene === 'chat') {
    return <TeamChat embedded={embedded} onComplete={handleChatComplete} onStepChange={onSlideChange} />
  }

  return (
    <div className={`tokenville${embedded ? ' tokenville--embedded' : ''}`}>
      <audio
        id="tokenville-audio"
        src="/audio/tokenville.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />

      {credit && (
        <div className="tokenville__credit" key={creditKey}>
          {credit}
        </div>
      )}

      <div className="tokenville__stage">
        {visibleChars.map(char => {
          const isDying = dyingIds.has(char.id)
          const isActive = activeSpeaker === char.id
          const isPassive = !isActive && !isDying

          let cls = 'tokenville__char'
          if (isDying) cls += ' tokenville__char--dying'
          else if (isActive) cls += ' tokenville__char--active'
          else if (isPassive) cls += ' tokenville__char--passive'
          if (appeared && !isDying) cls += ' tokenville__char--appeared'

          return (
            <div key={char.id} className={cls}>
              <div className="tokenville__char-inner">
                {isActive && bubble && (
                  <div className="tokenville__bubble" key={bubble}>
                    {bubble}
                  </div>
                )}
                <img src={char.image} alt={char.name} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
