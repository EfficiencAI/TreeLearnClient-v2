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
import { conversationAPI, sessionAPI } from '@renderer/api/API'

const AppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated, login } = useAuth()
  const [currentSession, setCurrentSession] = useState<string>('')
  const [isConversationMode, setIsConversationMode] = useState(false)
  const [nodeTreeSession, setNodeTreeSession] = useState('')
  const [activeChat, setActiveChat] = useState(0)
  const [showRegister, setShowRegister] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string>('') // 新增：存储选中的父节点ID
  const [selectedParentInfo, setSelectedParentInfo] = useState<{
    id: string
    content: string
  } | null>(null) // 新增：存储选中父节点的完整信息

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
      setSelectedParentInfo(null) // 重置父节点信息
    } else if (action === 'viewNodes') {
      setNodeTreeSession(sessionName)
    }
  }

  // 处理节点选择
  const handleNodeSelect = async (parentId: string): Promise<void> => {
    setSelectedParentId(parentId)
    setCurrentSession(nodeTreeSession) // 添加这行：设置当前会话
    setIsConversationMode(true) // 选择父节点时进入对话模式

    // 获取父节点的详细信息
    if (user?.userId && nodeTreeSession) {
      try {
        const response = await conversationAPI.get(parentId, user.userId, nodeTreeSession)
        if (response.code === 200 && response.obj) {
          const obj = response.obj as { userMessage?: string; message?: string }
          setSelectedParentInfo({
            id: parentId,
            content: obj.userMessage || obj.message || `节点 ${parentId}`
          })
        }
      } catch (error) {
        console.error('获取父节点信息失败:', error)
        setSelectedParentInfo({
          id: parentId,
          content: `节点 ${parentId}`
        })
      }
    }

    console.log('选中父节点ID:', parentId)
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
          selectedParentInfo={selectedParentInfo}
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
