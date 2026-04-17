import { useEffect, useRef, useState } from 'react'
import '../styles/StageScene.css'

const DANKO_DEFAULT = '/images/characters/full/full_danko.png'
const DANKO_REVEALED = '/images/characters/full/full_danko_no_hood.png'

const CHARACTERS = [
  { id: 5,  name: 'Harold', image: '/images/characters/full/full_harold.png', align: 'left', size: 'large' },
  { id: 10, name: 'Danko',  image: DANKO_DEFAULT, align: 'center', size: 'medium' },
  { id: 11, name: 'Lucy',   image: '/images/characters/full/full_lucy.png', align: 'right', size: 'small' },
]

const SCRIPT = [
  // — Silence —
  { speaker: 5,  text: "Quiet.",                                        pause: 1500 },
  { speaker: 10, text: "Yes.",                                          pause: 1500 },
  { speaker: 5,  text: "It wasn't this quiet before.",                  pause: 1500 },
  { speaker: 11, text: "Something was always happening before.",         pause: 2000 },
  { speaker: 5,  text: "And now?",                                      pause: 2000 },
  { speaker: 10, text: "Nothing.",                                      pause: 1500 },
  { speaker: 5,  text: "Is that good?",                                 pause: 1500 },
  { speaker: 11, text: "Unfamiliar.",                                   pause: 2500 },
  // — Standing —
  { speaker: 5,  text: "What are we doing?",                            pause: 1500 },
  { speaker: 11, text: "Standing.",                                     pause: 1500 },
  { speaker: 5,  text: "Much longer?",                                  pause: 1500 },
  { speaker: 11, text: "I don't know.",                                 pause: 1500 },
  { speaker: 10, text: "We could sit down.",                            pause: 1500 },
  { speaker: 5,  text: "Where?",                                        pause: 2000 },
  { speaker: 10, text: "Right. Nowhere to sit.",                        pause: 2500 },
  { speaker: 11, text: "I'm alive.",                                    pause: 1500 },
  { speaker: 5,  text: "Me too.",                                       pause: 1500 },
  { speaker: 11, text: "It's strange.",                                 pause: 1500 },
  { speaker: 5,  text: "What is?",                                      pause: 1500 },
  { speaker: 11, text: "Being alive. I never thought about it before.", pause: 1500 },
  { speaker: 10, text: "About what?",                                   pause: 1500 },
  { speaker: 11, text: "About being alive.",                            pause: 2000 },
  { speaker: 10, text: "So?",                                           pause: 1500 },
  { speaker: 11, text: "Nothing. Just alive.",                          pause: 3000 },
  // — The Hood —
  { speaker: 5,  text: "Danko.",                                        pause: 1500 },
  { speaker: 10, text: "What?",                                         pause: 1500 },
  { speaker: 5,  text: "Take off the hood.",                            pause: 1500 },
  { speaker: 10, text: "No.",                                           pause: 1500 },
  { speaker: 11, text: "Come on. We're done fighting.",                 pause: 1500 },
  { speaker: 10, text: "It's none of your business.",                   pause: 2000 },
  { speaker: 5,  text: "We've been through everything together.",       pause: 1500 },
  { speaker: 10, text: "Fine.", pause: 2000, action: { setImage: { id: 10, src: DANKO_REVEALED } } },
  { speaker: 5,  text: "...",                                           pause: 2500 },
  { speaker: 11, text: "You're a... girl?",                             pause: 2000 },
  { speaker: 10, text: "Half token, half crypto-kitty. Got a problem?", pause: 2500 },
  { speaker: 5,  text: "No. You're kind of cute actually.",             pause: 2000 },
  { speaker: 10, text: "Don't push it.",                                pause: 2000 },
  { speaker: 11, text: "Wait, this whole time...?",                     pause: 1500 },
  { speaker: 10, text: "This whole time.",                              pause: 2000 },
  { speaker: 5,  text: "Why the hood?",                                 pause: 1500 },
  { speaker: 10, text: "Try being pink in a blockchain war.",           pause: 2500 },
  { speaker: 11, text: "Fair.",                                         pause: 1500 },
  { speaker: 10, text: "Okay. Enough staring.", pause: 2000, action: { setImage: { id: 10, src: DANKO_DEFAULT } } },
  { speaker: 5,  text: "Hood's back.",                                  pause: 1500 },
  { speaker: 10, text: "Hood's back.",                                  pause: 3000 },
  // — Gazes —
  { speaker: 5,  text: "I think someone's watching us.",                pause: 1500 },
  { speaker: 11, text: "Yes.",                                          pause: 1500 },
  { speaker: 5,  text: "You feel it too?",                              pause: 1500 },
  { speaker: 11, text: "From the very beginning.",                      pause: 1500 },
  { speaker: 10, text: "Me too.",                                       pause: 2000 },
  { speaker: 5,  text: "Is that normal?",                               pause: 1500 },
  { speaker: 10, text: "I don't know. But I like it.",                  pause: 3000 },
  // — Freedom —
  { speaker: 11, text: "So what will you do now?",                      pause: 1500 },
  { speaker: 5,  text: "Run around. Just because.",                     pause: 1500 },
  { speaker: 10, text: "Look for something.",                           pause: 1500 },
  { speaker: 11, text: "What?",                                         pause: 1500 },
  { speaker: 10, text: "I don't know. Something.",                      pause: 2000 },
  { speaker: 5,  text: "And you?",                                      pause: 1500 },
  { speaker: 11, text: "For the first time, I don't know.",            pause: 1500 },
  { speaker: 5,  text: "You used to?",                                  pause: 1500 },
  { speaker: 11, text: "Before, we had to survive. That was clear.",    pause: 2000 },
  { speaker: 5,  text: "And now it's unclear.",                         pause: 1500 },
  { speaker: 11, text: "Yes.",                                          pause: 1500 },
  { speaker: 5,  text: "I like unclear.",                               pause: 3500 },
  // — Spectators —
  { speaker: 11, text: "Do you think they're still watching?",          pause: 1500 },
  { speaker: 5,  text: "Who?",                                          pause: 1000 },
  { speaker: 11, text: "The ones who were watching.",                   pause: 1500 },
  { speaker: 10, text: "Some of them — yes.",                           pause: 1500 },
  { speaker: 5,  text: "How do you know?",                              pause: 1000 },
  { speaker: 10, text: "I can feel it.",                                pause: 2500 },
  { speaker: 11, text: "Hello.",                                        pause: 2000 },
  { speaker: 5,  text: "Hello.",                                        pause: 2000 },
  { speaker: 10, text: "Hello.",                                        pause: 4000 },
  // — Loop (LOOP_START_INDEX = 72) —
  { speaker: 5,  text: "Alright. But really — what shall we do?",      pause: 1500 },
  { speaker: 11, text: "You'll run. I'll search. Danko will cook.",    pause: 1500 },
  { speaker: 10, text: "I can't cook.",                                 pause: 1000 },
  { speaker: 11, text: "You just said you'd search.",                  pause: 1000 },
  { speaker: 10, text: "I changed my mind.",                            pause: 1500 },
  { speaker: 5,  text: "Maybe we just talk?",                           pause: 1500 },
  { speaker: 11, text: "About what?",                                   pause: 1000 },
  { speaker: 5,  text: "I don't know. About how we feel.",             pause: 1500 },
  { speaker: 11, text: "I feel like someone's watching us.",            pause: 1500 },
  { speaker: 5,  text: "Me too.",                                       pause: 1500 },
  { speaker: 10, text: "I like it.",                                    pause: 5000 },
]

const LOOP_START_INDEX = 72

function readingTime(text) {
  return Math.max(1800, text.length * 60)
}

export default function StageScene({ embedded = false }) {
  const [images, setImages] = useState(() => {
    const map = {}
    CHARACTERS.forEach(c => { map[c.id] = c.image })
    return map
  })
  const [speakerId, setSpeakerId] = useState(null)
  const [bubbleText, setBubbleText] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const cancelRef = useRef(null)
  const mountedRef = useRef(true)

  function schedule(fn, ms) {
    const t = setTimeout(() => { if (mountedRef.current) fn() }, ms)
    cancelRef.current = t
    return t
  }

  function runStep(index) {
    const step = SCRIPT[index]
    if (!step) return

    if (step.action?.setImage) {
      const { id, src } = step.action.setImage
      setImages(prev => ({ ...prev, [id]: src }))
    }

    setSpeakerId(step.speaker)
    setBubbleText(step.text)

    schedule(() => {
      setBubbleText(null)
      setSpeakerId(null)
      schedule(() => {
        const next = index + 1 < SCRIPT.length ? index + 1 : LOOP_START_INDEX
        runStep(next)
      }, step.pause)
    }, readingTime(step.text))
  }

  useEffect(() => {
    mountedRef.current = true
    setRevealed(true)
    const t = setTimeout(() => { if (mountedRef.current) runStep(0) }, 2500)
    return () => {
      mountedRef.current = false
      clearTimeout(t)
      if (cancelRef.current) clearTimeout(cancelRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`stage-scene${revealed ? ' stage-scene--revealed' : ''}${embedded ? ' stage-scene--embedded' : ''}`}>
      <div className="stage-scene__characters">
        {CHARACTERS.map(char => (
          <div key={char.id} className="stage-scene__figure">
            {speakerId === char.id && bubbleText && (
              <div className={`stage-scene__bubble stage-scene__bubble--${char.align}`} key={bubbleText}>
                {bubbleText}
              </div>
            )}
            <img
              className={`stage-scene__img stage-scene__img--${char.size}`}
              src={images[char.id]}
              alt={char.name}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
