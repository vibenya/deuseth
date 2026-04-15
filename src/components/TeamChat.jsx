import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { createPlayer } from '../utils/createPlayer'
import '../styles/TeamChat.css'

// ─── Сценарий ─────────────────────────────────────────────────────────────────
// type: 'date'   — разделитель даты
// type: 'msg'    — сообщение (sender, time, lines: string[])
// type: 'pause'  — тихая пауза без сообщения
// type: 'system' — системное сообщение (Карен вышла из чата…)
// type: 'end'    — конец

const SCRIPT = [
  { type: 'date',   text: '11 апреля 2018',                                                           pause_after_ms: 400  },
  { type: 'msg',    sender: 'Карен',  time: '10:03', lines: ['написала синопсис финала', '📎 синопсис_ep10_v1.docx'], pause_after_ms: 1800 },
  { type: 'msg',    sender: 'Ваня',   time: '10:44', lines: ['карен это правда хорошо'],              pause_after_ms: 800  },
  { type: 'msg',    sender: 'Ваня',   time: '10:45', lines: ['но нас смотрит 5 человек', 'и денег на съёмки нет'], pause_after_ms: 3000 },
  { type: 'msg',    sender: 'Ваня',   time: '11:02', lines: ['слушайте', 'предлагаю просто объявить победителей', 'запустить контракт и написать пост'], pause_after_ms: 1000 },
  { type: 'msg',    sender: 'Катя',   time: '11:04', lines: ['честно по крайней мере'],               pause_after_ms: 800  },
  { type: 'msg',    sender: 'Карен',  time: '11:05', lines: ['это капитуляция'],                      pause_after_ms: 1000 },
  { type: 'msg',    sender: 'Ваня',   time: '11:06', lines: ['карен', 'а мы вообще можем переиграть победителей?'], pause_after_ms: 1000 },
  { type: 'msg',    sender: 'Кеша',   time: '11:07', lines: ['можем', 'но не будем', 'мы же честные'], pause_after_ms: 3500 },

  { type: 'date',   text: '13 апреля 2018',                                                           pause_after_ms: 400  },
  { type: 'msg',    sender: 'Кеша',   time: '16:03', lines: ['47 токенов погибли'],                   pause_after_ms: 3500 },
  { type: 'msg',    sender: 'Кеша',   time: '16:17', lines: ['harold, danko, lucy — выжили'],          pause_after_ms: 1200 },
  { type: 'msg',    sender: 'Ваня',   time: '16:18', lines: ['катя', 'пиши пост'],                    pause_after_ms: 1000 },
  { type: 'msg',    sender: 'Катя',   time: '16:19', lines: ['уже пишу'],                             pause_after_ms: 4000 },

  { type: 'system', text: 'Нет новых сообщений',                                                      pause_after_ms: 4000 },
  { type: 'end' },
]

// ─── Цвета отправителей ────────────────────────────────────────────────────────
const SENDER_COLORS = {
  'Ваня':  '#5b8dee',
  'Карен': '#e05c7a',
  'Кеша':  '#4db87a',
  'Катя':  '#e0a640',
  'Валя':  '#9b7ae0',
}

const TYPING_DELAY = 900   // сколько длится индикатор печатания
const APPEAR_DELAY = 1200  // задержка перед стартом

export default function TeamChat({ onComplete, onStepChange, embedded = false }) {
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
  const scrollRef  = useRef(null)

  function schedule(fn, ms) {
    const t = setTimeout(fn, ms)
    cancelRef.current = t
    return t
  }

  // Прокрутка вниз при добавлении сообщений
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  function runStep(index) {
    if (index >= SCRIPT.length) return
    const step = SCRIPT[index]
    onStepChange?.(index)

    const next = () => {
      stepRef.current = index + 1
      runStep(index + 1)
    }

    if (step.type === 'end') {
      setDone(true)
      schedule(() => {
        if (onComplete) onComplete()
      }, 2000)
      return
    }

    if (step.type === 'date') {
      sound(() => playDateRef.current.play())
      setMessages(prev => [...prev, { id: Date.now(), type: 'date', text: step.text }])
      schedule(next, step.pause_after_ms)
      return
    }

    if (step.type === 'system') {
      setMessages(prev => [...prev, { id: Date.now(), type: 'system', text: step.text }])
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
    }
  }, [])

  return (
    <div className={`teamchat${embedded ? ' teamchat--embedded' : ''}${done ? ' teamchat--done' : ''}`}>
      {/* Шапка */}
      <div className="teamchat__header">
        <div className="teamchat__header-dot" />
        <span className="teamchat__header-title">Deus ETH Production</span>
        <span className="teamchat__header-count">6 участников</span>
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
          const color = SENDER_COLORS[m.sender] || '#aaa'
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
              style={{ background: SENDER_COLORS[typing] || '#aaa' }}
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
