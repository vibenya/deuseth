import { useEffect, useState } from 'react'
import '../styles/Tokenville.css'
import TeamChat from './TeamChat'
import StageScene from './StageScene'

export default function Tokenville({ embedded = false, onSlideChange, teamChat, video, onSceneChange, skipRef, initialScene }) {
  // 'video' → explainer video, 'chat' → TeamChat scene, 'stage' → character stage
  const [scene, setScene] = useState(initialScene || (video ? 'video' : 'chat'))

  function goToScene(next) {
    setScene(next)
    onSceneChange?.(next)
  }

  // Expose skip to parent
  useEffect(() => {
    if (skipRef) {
      skipRef.current = () => {
        if (scene === 'video') goToScene('chat')
        else if (scene === 'chat') {
          const lastIndex = (teamChat?.script?.length ?? 1) - 1
          onSlideChange?.(lastIndex)
          goToScene('stage')
        }
      }
    }
  })

  function handleChatComplete() {
    goToScene('stage')
  }

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

  return <StageScene embedded={embedded} />
}
