import React from 'react'

interface MessageToolsProps {
  messageType: 'user' | 'ai'
}

const MessageTools: React.FC<MessageToolsProps> = ({ messageType }) => {
  const handleLike = (): void => {
    console.log('Like clicked')
  }

  const handleDislike = (): void => {
    console.log('Dislike clicked')
  }

  const handleRegenerate = (): void => {
    console.log('Regenerate clicked')
  }

  const handleCopy = (): void => {
    console.log('Copy clicked')
  }

  return (
    <div className="message-tools">
      {messageType === 'ai' && (
        <>
          <button onClick={handleLike}>👍</button>
          <button onClick={handleDislike}>👎</button>
        </>
      )}
      <button onClick={handleRegenerate}>↻</button>
      <button onClick={handleCopy}>复制</button>
    </div>
  )
}

export default MessageTools
