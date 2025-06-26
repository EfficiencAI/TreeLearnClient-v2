import React from 'react'
import ChatHistory from '../ChatHistory/ChatHistory'
import SidebarHeader from './SidebarHeader'
import SidebarFooter from './SidebarFooter'

interface SidebarProps {
  activeChat: number
  onChatSelect: (chatId: number) => void
  onSessionAction: (action: 'addConversation' | 'viewNodes', sessionName: string) => void // 新增
}

const Sidebar: React.FC<SidebarProps> = ({ activeChat, onChatSelect, onSessionAction }) => {
  return (
    <div className="sidebar">
      <SidebarHeader />
      <ChatHistory 
        activeChat={activeChat} 
        onChatSelect={onChatSelect} 
        onSessionAction={onSessionAction} // 新增传递
      />
      <SidebarFooter />
    </div>
  )
}

export default Sidebar
