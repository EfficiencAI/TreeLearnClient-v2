import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { sessionAPI } from '../../api/API'

const SidebarHeader: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const { user } = useAuth()
  const [alertMessage, setAlertMessage] = useState<string | null>(null)

  const AlertMessage: React.FC<{ message: string }> = ({ message }) => {
    const messageElement = document.createElement('div')
    messageElement.style.position = 'absolute'
    messageElement.style.visibility = 'hidden'
    messageElement.style.whiteSpace = 'nowrap'
    messageElement.style.font = '14px Arial'
    messageElement.textContent = message
    document.body.appendChild(messageElement)
    const messageWidth = messageElement.getBoundingClientRect().width
    document.body.removeChild(messageElement)

    const left = (window.innerWidth - messageWidth) / 2

    return (
      <div className="alert-message" style={{
        position: 'fixed',
        top: '20px',
        left: `${left}px`,
        background: 'rgba(169, 0, 0, 0.82)',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        animation: 'fadeInOut 2s ease-in-out forwards'
      }}>
        {message}
        <style>{styles}</style>
      </div>
    )
  }

  const styles = `
    @keyframes fadeInOut {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      10% {
        opacity: 1;
        transform: translateY(0);
      }
      90% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  `

  const handleNewChat = (): void => {
    setIsCreating(true)
  }

  const handleCreateSession = async (): Promise<void> => {
    if (!sessionName.trim() || !user?.userId) {
      // 修改：使用 user 而不是 userInfo
      setIsCreating(false)
      setAlertMessage('请输入会话名称')
      setTimeout(() => {
        setAlertMessage(null)
      }, 2000) // 2秒后自动隐藏
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

      {alertMessage && (
        <AlertMessage message={alertMessage} />
      )}

    </div>
  )
}

export default SidebarHeader
