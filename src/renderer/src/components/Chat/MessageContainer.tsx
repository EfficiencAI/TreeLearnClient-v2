import React from 'react'
import { Message as MessageType } from '../../types'
import Message from './Message'

interface MessageContainerProps {
  messages: MessageType[]
  streamingMessageId?: string | null
}

const MessageContainer: React.FC<MessageContainerProps> = ({ 
  messages, 
  streamingMessageId 
}) => {
  return (
    <div className="message-container">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          isStreaming={streamingMessageId === message.id}
        />
      ))}
    </div>
  )
}

export default MessageContainer
