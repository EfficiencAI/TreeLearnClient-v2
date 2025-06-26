import React, { useState, useCallback } from 'react'
import { Message } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../share/share'
import { conversationAPI } from '../../api/API'
import MessageContainer from './MessageContainer'
import ChatInput from './ChatInput'
import { flushSync } from 'react-dom'

interface ChatAreaProps {
  currentSession?: string
  isConversationMode?: boolean
  selectedParentId?: string
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentSession,
  isConversationMode = false,
  selectedParentId = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const { user } = useAuth()
  const { settings } = useSettings()

  // 简化的流式更新函数 - 移除复杂的节流逻辑
  const updateStreamingMessage = useCallback((messageId: string, content: string) => {
    flushSync(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)))
    })
  }, [])

  const handleSendMessage = async (content: string): Promise<void> => {
    if (!user?.userId || !currentSession || !isConversationMode) {
      // 非对话模式，使用原有逻辑
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: content,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, newMessage])
      return
    }

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content,
      timestamp: new Date()
    }
    setMessages((prev) => [...prev, userMessage])

    // 添加AI消息占位符
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date()
    }
    setMessages((prev) => [...prev, aiMessage])

    setIsLoading(true)
    setStreamingMessageId(aiMessageId)

    try {
      // 确定父节点ID
      const parentId = selectedParentId || '-1'
      console.log('发送消息，父节点ID:', parentId)

      // 调用AI API
      const response = await fetch('http://localhost:8080/user/conversation/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          userId: user.userId,
          sessionName: currentSession,
          conversationNodeId: Date.now().toString(),
          parentId: parentId,
          userMessage: content,
          contextStartIdx: '0',
          contextEndIdx: '0',
          message: content,
          apikey: settings.apiKey,
          baseurl: settings.baseUrl,
          modelName: settings.modelName,
          systemPrompt: settings.systemPrompt,
          mcpUrls: settings.mcpUrls || []
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      console.log('开始流式处理...')
      let aiContent = ''
      let buffer = '' // 缓冲区处理不完整的数据
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('流式传输结束，总共接收', chunkCount, '个数据块')
          console.log('最终内容长度:', aiContent.length)

          // 流式传输结束，最后一次更新
          updateStreamingMessage(aiMessageId, aiContent)

          setStreamingMessageId(null)
          await fetchAllNodes()
          setIsLoading(false)
          break
        }

        chunkCount++
        // 解码数据块
        const chunk = decoder.decode(value, { stream: true })
        console.log(`接收到第${chunkCount}个数据块:`, chunk)
        buffer += chunk

        // 按行处理数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一行（可能不完整）

        // 修改第141-162行的逻辑
        for (const line of lines) {
          console.log('处理行数据:', line)
        
          // 处理空行（保留换行）
          if (line.trim() === '') {
            aiContent += '\n'
            updateStreamingMessage(aiMessageId, aiContent)
            continue
          }
        
          // 移除可能的 "data: " 或 "data:" 前缀
          let cleanData = line.trim()
          if (cleanData.startsWith('data: ')) {
            cleanData = cleanData.substring(6)
          } else if (cleanData.startsWith('data:')) {
            cleanData = cleanData.substring(5)
          }
        
          console.log('清理后的数据:', cleanData)
        
          // 跳过特殊标记，累加AI内容并解析换行符
          if (cleanData !== '[DONE]') {
            // 将 \\n 字符串转换为实际换行符
            const processedData = cleanData.replace(/\\n/g, '\n')
            aiContent += processedData
            console.log('累积内容长度:', aiContent.length, '最新片段:', processedData)
        
            // 直接更新
            updateStreamingMessage(aiMessageId, aiContent)
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error)

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId ? { ...msg, content: '抱歉，AI回复失败，请重试。' } : msg
        )
      )
      setStreamingMessageId(null)
      setIsLoading(false)
    }
  }

  // 获取所有节点（对话结束后调用）
  const fetchAllNodes = async (): Promise<void> => {
    if (!user?.userId || !currentSession) return

    try {
      const response = await conversationAPI.getAllIds(user.userId, currentSession)
      if (response.code === 200 && response.obj) {
        console.log('当前会话的所有节点:', response.obj)
      }
    } catch (error) {
      console.error('获取节点失败:', error)
    }
  }

  return (
    <div className="chat-area">
      {isConversationMode && currentSession && (
        <div className="conversation-header">
          <span>对话模式 - {currentSession}</span>
          {selectedParentId && <span className="parent-node-info">父节点: {selectedParentId}</span>}
        </div>
      )}
      <MessageContainer messages={messages} streamingMessageId={streamingMessageId} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

export default ChatArea
