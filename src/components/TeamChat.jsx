import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { createPlayer } from '../utils/createPlayer'
import '../styles/TeamChat.css'

const TYPING_DELAY = 900
const APPEAR_DELAY = 1200
const MARK_DELAY_DEFAULT = 500

export default function TeamChat({ script, senderColors, header, onComplete, onStepChange, embedded = false }) {
  const [messages, setMessages] = useState([])
  const [typing, setTyping]     = useState(null)
  const [done, setDone]         = useState(false)
  const [muted, setMuted]       = useState(false)
  const mutedRef                = useRef(false)

  const playMsgRef    = useRef(null)
  const playTypingRef = useRef(null)
  const playDateRef   = useRef(null)
  if (!playMsgRef.current)    playMsgRef.current    = createPlayer('/sounds/cool-click.wav', 0.5)
  if (!playTypingRef.current) playTypingRef.current = createPlayer('/sounds/message-pop.mp3', 0.3)
  if (!playDateRef.current)   playDateRef.current   = createPlayer('/sounds/light-button.wav', 0.25)

  function toggleMute() {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
  }

  function sound(fn) {
    if (!mutedRef.current) fn()
  }

  const stepRef    = useRef(0)
  const cancelRef  = useRef(null)
  const markRef    = useRef(null)
  const scrollRef  = useRef(null)

  function schedule(fn, ms) {
    const t = setTimeout(fn, ms)
    cancelRef.current = t
    return t
  }

  function scheduleMark(index, ms) {
    if (markRef.current) clearTimeout(markRef.current)
    markRef.current = setTimeout(() => onStepChange?.(index), ms)
  }

  // Прокрутка вниз при добавлении сообщений
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  function runStep(index) {
    if (index >= script.length) return
    const step = script[index]

    const next = () => {
      stepRef.current = index + 1
      runStep(index + 1)
    }

    if (step.type === 'end') {
      onStepChange?.(index)
      if (onComplete) {
        setDone(true)
        schedule(() => onComplete(), 2000)
      }
      return
    }

    if (step.type === 'date') {
      sound(() => playDateRef.current.play())
      setMessages(prev => [...prev, { id: Date.now(), type: 'date', text: step.text }])
      onStepChange?.(index)
      schedule(next, step.pause_after_ms)
      return
    }

    if (step.type === 'system') {
      setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: step.text }])
      onStepChange?.(index)
      schedule(next, step.pause_after_ms)
      return
    }

    if (step.type === 'msg') {
      // Показываем "печатает…"
      setTyping(step.sender)
      sound(() => playTypingRef.current.play())
      schedule(() => {
        setTyping(null)
        sound(() => playMsgRef.current.play())
        setMessages(prev => [...prev, {
          id:     Date.now() + Math.random(),
          type:   'msg',
          sender: step.sender,
          time:   step.time,
          lines:  step.lines,
        }])
        // Эмитим индекс шага не сразу, а после того как сообщение появилось
        // и прошла драматическая пауза — чтобы смерти/победы подхватывались
        // уже после того, как зритель прочитал реплику.
        const markMs = step.mark_delay_ms ?? MARK_DELAY_DEFAULT
        scheduleMark(index, markMs)
        schedule(next, step.pause_after_ms)
      }, TYPING_DELAY)
      return
    }
  }

  useEffect(() => {
    const t = setTimeout(() => runStep(0), APPEAR_DELAY)
    return () => {
      clearTimeout(t)
      if (cancelRef.current) clearTimeout(cancelRef.current)
      if (markRef.current) clearTimeout(markRef.current)
    }
  }, [])

  return (
    <div className={`teamchat${embedded ? ' teamchat--embedded' : ''}${done ? ' teamchat--done' : ''}`}>
      {/* Шапка */}
      <div className="teamchat__header">
        <div className="teamchat__header-dot" />
        <span className="teamchat__header-title">{header?.title ?? 'Deus ETH Production'}</span>
        <span className="teamchat__header-count">{header?.memberCount ?? ''}</span>
      </div>

      {/* Лента сообщений */}
      <div className="teamchat__feed" ref={scrollRef}>
        {messages.map(m => {
          if (m.type === 'date') {
            return (
              <div key={m.id} className="teamchat__date-sep">
                <span>{m.text}</span>
              </div>
            )
          }
          if (m.type === 'system') {
            return (
              <div key={m.id} className="teamchat__system">
                {m.text}
              </div>
            )
          }
          const color = senderColors[m.sender] || '#aaa'
          return (
            <div key={m.id} className="teamchat__msg teamchat__msg--appear">
              <div className="teamchat__avatar" style={{ background: color }}>
                {m.sender[0]}
              </div>
              <div className="teamchat__body">
                <div className="teamchat__meta">
                  <span className="teamchat__sender" style={{ color }}>{m.sender}</span>
                  <span className="teamchat__time">{m.time}</span>
                </div>
                {m.lines.map((line, i) => (
                  <div key={i} className="teamchat__line">{line}</div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Индикатор печатания */}
        {typing && (
          <div className="teamchat__msg teamchat__typing-row">
            <div
              className="teamchat__avatar"
              style={{ background: senderColors[typing] || '#aaa' }}
            >
              {typing[0]}
            </div>
            <div className="teamchat__typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
      <button className="teamchat__mute-btn" onClick={toggleMute} title={muted ? 'Включить звук' : 'Выключить звук'}>
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  )
}
