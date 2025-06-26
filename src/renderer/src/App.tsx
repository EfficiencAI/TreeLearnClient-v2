import React, { useState } from 'react'
import { SettingsProvider } from './components/Providers/SettingsProvider'
import { useAuth } from './hooks/useAuth'
import { UserInfo } from './share/share'
import Sidebar from './components/Sidebar/Sidebar'
import ChatHeader from './components/Chat/ChatHeader'
import ChatArea from './components/Chat/ChatArea'
import LoginPage from './components/Pages/LoginPage'
import RegisterPage from './components/Pages/RegisterPage'
import './assets/ChatPage.css'

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated, login } = useAuth()
  const [currentSession, setCurrentSession] = useState<string>('')
  const [isConversationMode, setIsConversationMode] = useState(false)
  const [activeChat, setActiveChat] = useState(0)
  const [showRegister, setShowRegister] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string>('') // 新增：存储选中的父节点ID

  // 处理会话选择
  const handleChatSelect = (chatId: number, sessionName: string): void => {
    setActiveChat(chatId)
    setCurrentSession(sessionName)
    setIsConversationMode(true)
  }

  // 处理会话操作
  const handleSessionAction = (
    action: 'addConversation' | 'viewNodes',
    sessionName: string
  ): void => {
    if (action === 'addConversation') {
      setCurrentSession(sessionName)
      setIsConversationMode(true)
      setSelectedParentId('') // 重置父节点ID
    } 
    else if (action === 'viewNodes') {}
  }

  // 处理登录成功
  const handleLoginSuccess = async (userInfo: UserInfo) => {
    await login(userInfo)
  }

  // 处理注册成功
  const handleRegisterSuccess = async (userInfo: UserInfo) => {
    await login(userInfo)
  }

  if (isLoading) {
    return (
      <div className="app loading-container">
        <div className="loading-spinner">加载中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onSessionAction={handleSessionAction}
      />
      <div className="main-content">
        <ChatHeader
          currentSession={currentSession}
          isConversationMode={isConversationMode}
        />
        <ChatArea
          currentSession={currentSession}
          isConversationMode={isConversationMode}
          selectedParentId={selectedParentId} // 传递选中的父节点ID
        />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  )
}

export default App
