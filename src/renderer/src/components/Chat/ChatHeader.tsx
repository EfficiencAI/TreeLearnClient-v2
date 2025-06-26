import React, { useState, useRef } from 'react'
import { useSettings } from '../../share/share'
import { useAuth } from '../../hooks/useAuth' // 添加useAuth导入
import Menu from '../Menu/Menu'
import SettingsPage from '../Pages/SettingsPage'
import VersionPage from '../Pages/VersionPage'
import AuthorPage from '../Pages/AuthorPage'
import GitHubPage from '../Pages/GitHubPage'

interface ChatHeaderProps {
  currentSession?: string
  isConversationMode?: boolean
  selectedParentInfo?: {id: string, content: string} | null
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  currentSession, 
  isConversationMode, 
  selectedParentInfo 
}) => {
  const { isDarkMode } = useSettings()
  const { logout } = useAuth() // 添加logout函数
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleRefresh = (): void => {
    // TODO: 实现刷新功能
    console.log('Refresh clicked')
  }

  const handleMenu = (): void => {
    setIsMenuOpen(true)
  }

  const handleCloseMenu = (): void => {
    setIsMenuOpen(false)
  }

  const handleNavigate = (page: string): void => {
    if (page === 'logout') {
      logout()
      return
    }
    setCurrentPage(page)
  }

  const handleBackToChat = (): void => {
    setCurrentPage(null)
  }

  // 如果当前有页面显示，渲染对应页面
  if (currentPage) {
    switch (currentPage) {
      case 'settings':
        return <SettingsPage onBack={handleBackToChat} />
      case 'version':
        return <VersionPage onBack={handleBackToChat} />
      case 'author':
        return <AuthorPage onBack={handleBackToChat} />
      case 'github':
        return <GitHubPage onBack={handleBackToChat} />
      default:
        return null
    }
  }

  return (
    <>
      <div className={`chat-header ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="model-info">
          <span className="model-badge">AI</span>
          <span className="model-desc">
            {isConversationMode ? (
              `对话模式 - ${currentSession || '聊天对话'}`
            ) : (
              '聊天对话'
            )}
          </span>
        </div>
        <div className="chat-actions">
          <button className="action-btn" onClick={handleRefresh}>
            ↻
          </button>
          <button ref={menuButtonRef} className="action-btn" onClick={handleMenu}>
            ⋮
          </button>
        </div>
      </div>
      <Menu
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
        onNavigate={handleNavigate}
        buttonRef={menuButtonRef}
      />
    </>
  )
}

export default ChatHeader
