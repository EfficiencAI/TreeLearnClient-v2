import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { sessionAPI } from '../../api/API'
import ChatHistoryItem from './ChatHistoryItem'

interface Session {
  sessionName: string
  createdAt?: string
}

interface ChatHistoryProps {
  activeChat: number
  onChatSelect: (chatId: number) => void
  onSessionAction: (action: 'addConversation' | 'viewNodes', sessionName: string) => void // 新增
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  activeChat,
  onChatSelect,
  onSessionAction // 新增
}) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth() // 修改：使用user而不是userInfo

  // 获取会话列表
  const fetchSessions = useCallback(async (): Promise<void> => {
    if (!user?.userId) return

    setLoading(true)
    try {
      const response = await sessionAPI.getAllNames(user.userId)
      if (response.code === 200 && response.obj) {
        const sessionList = response.obj.map((name) => ({ sessionName: name }))
        setSessions(sessionList)
      }
    } catch (error) {
      console.error('获取会话列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.userId]) // 修复：添加user?.userId作为依赖

  // 删除会话
  const handleDeleteSession = async (sessionName: string): Promise<void> => {
    if (!user?.userId) return // 修改：使用user而不是userInfo

    if (!confirm(`确定要删除会话 "${sessionName}" 吗？`)) return

    try {
      const response = await sessionAPI.delete(user.userId, sessionName) // 修改：使用user而不是userInfo
      if (response.code === 200) {
        setSessions((prev) => prev.filter((s) => s.sessionName !== sessionName))
      } else {
        alert('删除失败：' + response.msg) // 修改：使用msg而不是message
      }
    } catch (error) {
      console.error('删除会话失败:', error)
      alert('删除会话失败')
    }
  }

  // 更新会话名称
  const handleUpdateSession = async (oldName: string, newName: string): Promise<void> => {
    if (!user?.userId || !newName.trim()) return // 修改：使用user而不是userInfo

    try {
      const response = await sessionAPI.update({
        // 修改：使用user而不是userInfo
        userId: user.userId,
        sessionName: oldName,
        newSessionName: newName.trim()
      })

      if (response.code === 200) {
        setSessions((prev) =>
          prev.map((s) => (s.sessionName === oldName ? { ...s, sessionName: newName.trim() } : s))
        )
      } else {
        alert('更新失败：' + response.msg) // 修改：使用msg而不是message
      }
    } catch (error) {
      console.error('更新会话失败:', error)
      alert('更新会话失败')
    }
  }

  // 监听会话创建事件
  useEffect(() => {
    const handleSessionCreated = (): void => {
      fetchSessions()
    }

    window.addEventListener('sessionCreated', handleSessionCreated)
    return () => window.removeEventListener('sessionCreated', handleSessionCreated)
  }, [fetchSessions])

  // 初始加载
  useEffect(() => {
    fetchSessions()
  }, [user?.userId]) // 修改：使用user而不是userInfo

  if (loading) {
    return <div className="chat-history loading">加载中...</div>
  }

  const handleAddConversation = (sessionName: string): void => {
    onSessionAction('addConversation', sessionName)
  }

  const handleViewNodes = (sessionName: string): void => {
    onSessionAction('viewNodes', sessionName)
  }

  return (
    <div className="chat-history">
      <div className="section-title">会话列表</div>
      {sessions.length === 0 ? (
        <div className="empty-sessions">暂无会话</div>
      ) : (
        sessions.map((session, index) => (
          <ChatHistoryItem
            key={session.sessionName}
            session={session}
            isActive={activeChat === index}
            onClick={() => onChatSelect(index)}
            onDelete={() => handleDeleteSession(session.sessionName)}
            onUpdate={(newName) => handleUpdateSession(session.sessionName, newName)}
            onAddConversation={handleAddConversation} // 新增
            onViewNodes={handleViewNodes} // 新增
          />
        ))
      )}
    </div>
  )
}

export default ChatHistory
