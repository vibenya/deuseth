import { useEffect, useRef, useState } from 'react'
import '../styles/Tokenville.css'
import TeamChat from './TeamChat'

const DANKO_DEFAULT_IMAGE = '/images/characters/full/full_danko.png'
const DANKO_REVEALED_IMAGE = '/images/cards/card_00007.png'

const SCRIPT = [
  // — The Hood —
  { speaker: 5,    text: "Danko.",                                           pause_after_ms: 1500 },
  { speaker: 10,   text: "What?",                                           pause_after_ms: 1500 },
  { speaker: 5,    text: "Take off the hood.",                               pause_after_ms: 1500 },
  { speaker: 10,   text: "No.",                                              pause_after_ms: 1500 },
  { speaker: 11,   text: "Come on. We're done fighting.",                    pause_after_ms: 1500 },
  { speaker: 10,   text: "It's none of your business.",                      pause_after_ms: 2000 },
  { speaker: 5,    text: "We've been through everything together.",          pause_after_ms: 1500 },
  { speaker: 10,   text: "Fine.",                                            pause_after_ms: 2000, action: { setImage: { id: 10, src: DANKO_REVEALED_IMAGE } } },
  { speaker: 5,    text: "...",                                              pause_after_ms: 2500 },
  { speaker: 11,   text: "You're a... girl?",                               pause_after_ms: 2000 },
  { speaker: 10,   text: "Half token, half crypto-kitty. Got a problem?",    pause_after_ms: 2500 },
  { speaker: 5,    text: "No. You're kind of cute actually.",                pause_after_ms: 2000 },
  { speaker: 10,   text: "Don't push it.",                                   pause_after_ms: 2000 },
  { speaker: 11,   text: "Wait, this whole time...?",                        pause_after_ms: 1500 },
  { speaker: 10,   text: "This whole time.",                                 pause_after_ms: 2000 },
  { speaker: 5,    text: "Why the hood?",                                    pause_after_ms: 1500 },
  { speaker: 10,   text: "Try being pink in a blockchain war.",              pause_after_ms: 2500 },
  { speaker: 11,   text: "Fair.",                                            pause_after_ms: 1500 },
  { speaker: 10,   text: "Okay. Enough staring.",                           pause_after_ms: 2000, action: { setImage: { id: 10, src: DANKO_DEFAULT_IMAGE } } },
  { speaker: 5,    text: "Hood's back.",                                     pause_after_ms: 1500 },
  { speaker: 10,   text: "Hood's back.",                                     pause_after_ms: 3000 },

  // — Silence —
  { speaker: 5,    text: "Quiet.",                                           pause_after_ms: 1500 },
  { speaker: 10,   text: "Yes.",                                             pause_after_ms: 1500 },
  { speaker: 5,    text: "It wasn't this quiet before.",                     pause_after_ms: 1500 },
  { speaker: 11,   text: "Something was always happening before.",           pause_after_ms: 2000 },
  { speaker: 5,    text: "And now?",                                         pause_after_ms: 2000 },
  { speaker: 10,   text: "Nothing.",                                         pause_after_ms: 1500 },
  { speaker: 5,    text: "Is that good?",                                    pause_after_ms: 1500 },
  { speaker: 11,   text: "Unfamiliar.",                                      pause_after_ms: 2500 },

  // — Standing —
  { speaker: 5,    text: "What are we doing?",                               pause_after_ms: 1500 },
  { speaker: 11,   text: "Standing.",                                        pause_after_ms: 1500 },
  { speaker: 5,    text: "Much longer?",                                     pause_after_ms: 1500 },
  { speaker: 11,   text: "I don't know.",                                    pause_after_ms: 1500 },
  { speaker: 10,   text: "We could sit down.",                               pause_after_ms: 1500 },
  { speaker: 5,    text: "Where?",                                           pause_after_ms: 2000 },
  { speaker: 10,   text: "Right. Nowhere to sit.",                           pause_after_ms: 2500 },
  { speaker: 11,   text: "I'm alive.",                                       pause_after_ms: 1500 },
  { speaker: 5,    text: "Me too.",                                          pause_after_ms: 1500 },
  { speaker: 11,   text: "It's strange.",                                    pause_after_ms: 1500 },
  { speaker: 5,    text: "What is?",                                         pause_after_ms: 1500 },
  { speaker: 11,   text: "Being alive. I never thought about it before.",    pause_after_ms: 1500 },
  { speaker: 10,   text: "About what?",                                      pause_after_ms: 1500 },
  { speaker: 11,   text: "About being alive.",                               pause_after_ms: 2000 },
  { speaker: 10,   text: "So?",                                              pause_after_ms: 1500 },
  { speaker: 11,   text: "Nothing. Just alive.",                             pause_after_ms: 3000 },

  // — Gazes —
  { speaker: 5,    text: "I think someone's watching us.",                   pause_after_ms: 1500 },
  { speaker: 11,   text: "Yes.",                                             pause_after_ms: 1500 },
  { speaker: 5,    text: "You feel it too?",                                 pause_after_ms: 1500 },
  { speaker: 11,   text: "From the very beginning.",                         pause_after_ms: 1500 },
  { speaker: 10,   text: "Me too.",                                          pause_after_ms: 2000 },
  { speaker: 5,    text: "Is that normal?",                                  pause_after_ms: 1500 },
  { speaker: 10,   text: "I don't know. But I like it.",                     pause_after_ms: 3000 },

  // — Freedom —
  { speaker: 11,   text: "So what will you do now?",                         pause_after_ms: 1500 },
  { speaker: 5,    text: "Run around. Just because.",                        pause_after_ms: 1500 },
  { speaker: 10,   text: "Look for something.",                              pause_after_ms: 1500 },
  { speaker: 11,   text: "What?",                                            pause_after_ms: 1500 },
  { speaker: 10,   text: "I don't know. Something.",                         pause_after_ms: 2000 },
  { speaker: 5,    text: "And you?",                                         pause_after_ms: 1500 },
  { speaker: 11,   text: "For the first time, I don't know.",               pause_after_ms: 1500 },
  { speaker: 5,    text: "You used to?",                                     pause_after_ms: 1500 },
  { speaker: 11,   text: "Before, we had to survive. That was clear.",       pause_after_ms: 2000 },
  { speaker: 5,    text: "And now it's unclear.",                            pause_after_ms: 1500 },
  { speaker: 11,   text: "Yes.",                                             pause_after_ms: 1500 },
  { speaker: 5,    text: "I like unclear.",                                  pause_after_ms: 3500 },

  // — Spectators —
  { speaker: 11,   text: "Do you think they're still watching?",             pause_after_ms: 1500 },
  { speaker: 5,    text: "Who?",                                             pause_after_ms: 1000 },
  { speaker: 11,   text: "The ones who were watching.",                      pause_after_ms: 1500 },
  { speaker: 10,   text: "Some of them — yes.",                              pause_after_ms: 1500 },
  { speaker: 5,    text: "How do you know?",                                 pause_after_ms: 1000 },
  { speaker: 10,   text: "I can feel it.",                                   pause_after_ms: 2500 },
  { speaker: 11,   text: "Hello.",                                           pause_after_ms: 2000 },
  { speaker: 5,    text: "Hello.",                                           pause_after_ms: 2000 },
  { speaker: 10,   text: "Hello.",                                           pause_after_ms: 4000 },

  // — Loop (LOOP_START_INDEX) —
  { speaker: 5,    text: "Alright. But really — what shall we do?",          pause_after_ms: 1500 },
  { speaker: 11,   text: "You'll run. I'll search. Danko will cook.",        pause_after_ms: 1500 },
  { speaker: 10,   text: "I can't cook.",                                    pause_after_ms: 1000 },
  { speaker: 11,   text: "You just said you'd search.",                      pause_after_ms: 1000 },
  { speaker: 10,   text: "I changed my mind.",                               pause_after_ms: 1500 },
  { speaker: 5,    text: "Maybe we just talk?",                              pause_after_ms: 1500 },
  { speaker: 11,   text: "About what?",                                      pause_after_ms: 1000 },
  { speaker: 5,    text: "I don't know. About how we feel.",                 pause_after_ms: 1500 },
  { speaker: 11,   text: "I feel like someone's watching us.",               pause_after_ms: 1500 },
  { speaker: 5,    text: "Me too.",                                          pause_after_ms: 1500 },
  { speaker: 10,   text: "I like it.",                                       pause_after_ms: 5000 },
]

const LOOP_START_INDEX = 72

const DEFAULT_CHARACTERS = [
  { id: 5,  name: 'Harold', image: '/images/characters/full/full_harold.png' },
  { id: 10, name: 'Danko',  image: DANKO_DEFAULT_IMAGE },
  { id: 11, name: 'Lucy',   image: '/images/characters/full/full_lucy.png' },
]

function readingTime(text) {
  if (!text) return 1800
  const ms = Math.max(1800, text.length * 60)
  return ms
}

export default function Tokenville({ embedded = false, onSlideChange, teamChat, video, onSceneChange, skipRef }) {
  // 'video' → explainer video, 'chat' → TeamChat scene, 'stage' → character stage
  const [scene, setScene] = useState(video ? 'video' : 'chat')

  function goToScene(next) {
    setScene(next)
    onSceneChange?.(next)
  }

  // Expose skip to parent
  if (skipRef) {
    skipRef.current = () => {
      if (scene === 'video') goToScene('chat')
      else if (scene === 'chat') {
        // Report final slide index so all slide-triggered events (deaths, winners) fire
        const lastIndex = (teamChat?.script?.length ?? 1) - 1
        onSlideChange?.(lastIndex)
        goToScene('stage')
      }
    }
  }

  const [characters, setCharacters] = useState(DEFAULT_CHARACTERS)
  const [aliveIds, setAliveIds] = useState(new Set([5, 10, 11]))
  const [dyingIds, setDyingIds] = useState(new Set())
  // Active speaker id (or null)
  const [activeSpeaker, setActiveSpeaker] = useState(null)
  // Current bubble text
  const [bubble, setBubble] = useState(null)
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

    if (step.action?.setImage) {
      const { id, src } = step.action.setImage
      setCharacters(prev => prev.map(c => c.id === id ? { ...c, image: src } : c))
    }

    setActiveSpeaker(step.speaker)
    setBubble(step.text)

    const tRead = readingTime(step.text)
    schedule(() => {
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
    goToScene('stage')
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

  const visibleChars = characters.filter(c => aliveIds.has(c.id))

  if (scene === 'video') {
    return (
      <div className={`tokenville${embedded ? ' tokenville--embedded' : ''}`}>
        <video
          className="tokenville__video"
          src={video}
          autoPlay
          playsInline
          controls
          onEnded={() => goToScene('chat')}
        />
      </div>
    )
  }

  if (scene === 'chat') {
    return <TeamChat script={teamChat?.script} senderColors={teamChat?.senderColors ?? {}} header={teamChat?.header} embedded={embedded} onComplete={handleChatComplete} onStepChange={onSlideChange} />
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
