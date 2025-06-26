import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { sessionAPI } from '../../api/API'

const SidebarHeader: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const { user } = useAuth() // 修改：使用 user 而不是 userInfo

  const handleNewChat = (): void => {
    setIsCreating(true)
  }

  const handleCreateSession = async (): Promise<void> => {
    if (!sessionName.trim() || !user?.userId) {
      // 修改：使用 user 而不是 userInfo
      alert('请输入会话名称')
      return
    }

    try {
      const response = await sessionAPI.create({
        // 修改：使用 create 而不是 createSession
        userId: user.userId, // 修改：使用 user 而不是 userInfo
        sessionName: sessionName.trim()
      })

      if (response.code === 200) {
        setSessionName('')
        setIsCreating(false)
        // 触发会话列表刷新
        window.dispatchEvent(new CustomEvent('sessionCreated'))
      } else {
        alert('创建会话失败：' + response.msg) // 修改：使用 msg 而不是 message
      }
    } catch (error) {
      console.error('创建会话失败:', error)
      alert('创建会话失败')
    }
  }

  const handleCancel = (): void => {
    setSessionName('')
    setIsCreating(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleCreateSession()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="sidebar-header">
      <div className="logo">
        <div className="logo-icon">TL</div>
        <span>AI Chat</span>
      </div>

      {isCreating ? (
        <div className="new-session-input">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入会话名称"
            autoFocus
            className="session-name-input"
          />
          <div className="input-actions">
            <button onClick={handleCreateSession} className="confirm-btn">
              ✓
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button className="new-chat-btn" onClick={handleNewChat}>
          <span className="plus-icon">+</span> New Session
        </button>
      )}
    </div>
  )
}

export default SidebarHeader
