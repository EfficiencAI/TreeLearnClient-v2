import React from 'react'
import { Message as MessageType } from '../../types'
import MessageTools from './MessageTools'
import StreamingMarkdown from './StreamingMarkdown'

interface MessageProps {
  message: MessageType
  isStreaming?: boolean
}

const Message: React.FC<MessageProps> = ({ message, isStreaming = false }) => {
  const isAI = message.type === 'ai'

  return (
    <div className={`message ${isAI ? 'ai-message' : 'user-message'}`}>
      <div className="avatar">{isAI ? 'AI' : 'U'}</div>
      <div className="message-content">
        {isAI ? (
          <StreamingMarkdown 
            content={message.content} 
            isStreaming={isStreaming}
          />
        ) : (
          <div className="user-text">
            {/* 移除HTML标签，显示纯文本 */}
            {message.content.replace(/<[^>]*>/g, '')}
          </div>
        )}
        <MessageTools messageType={message.type} />
      </div>
    </div>
  )
}

export default Message
