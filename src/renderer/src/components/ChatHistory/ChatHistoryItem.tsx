import React, { useState, useRef, useEffect } from 'react'

interface Session {
  sessionName: string
  createdAt?: string
}

interface ChatHistoryItemProps {
  session: Session
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onUpdate: (newName: string) => void
  onAddConversation: (sessionName: string) => void // 新增
  onViewNodes: (sessionName: string) => void // 新增
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  session,
  isActive,
  onClick,
  onDelete,
  onUpdate,
  onAddConversation, // 新增
  onViewNodes // 新增
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(session.sessionName)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  // 开始编辑
  const handleEdit = (): void => {
    setIsEditing(true)
    setShowContextMenu(false)
    setEditName(session.sessionName)
  }

  // 确认编辑
  const handleConfirmEdit = (): void => {
    if (editName.trim() && editName.trim() !== session.sessionName) {
      onUpdate(editName.trim())
    }
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancelEdit = (): void => {
    setIsEditing(false)
    setEditName(session.sessionName)
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleConfirmEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  // 处理删除
  const handleDelete = (): void => {
    setShowContextMenu(false)
    onDelete()
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showContextMenu])

  // 编辑时自动聚焦
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // 添加对话
  const handleAddConversation = (): void => {
    setShowContextMenu(false)
    onAddConversation(session.sessionName)
  }

  // 查看所有节点
  const handleViewNodes = (): void => {
    setShowContextMenu(false)
    onViewNodes(session.sessionName)
  }

  return (
    <>
      <div
        className={`chat-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        <div className="chat-icon">💬</div>
        <div className="chat-info">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleConfirmEdit}
              className="edit-input"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="chat-title">{session.sessionName}</div>
          )}
        </div>
      </div>

      {showContextMenu && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            position: 'fixed',
            left: menuPosition.x,
            top: menuPosition.y,
            zIndex: 1000
          }}
        >
          <div className="menu-item" onClick={handleAddConversation}>
            <span>添加对话</span>
          </div>
          <div className="menu-item" onClick={handleViewNodes}>
            <span>查看所有节点</span>
          </div>
          <div className="menu-item" onClick={handleEdit}>
            <span>重命名</span>
          </div>
          <div className="menu-item delete" onClick={handleDelete}>
            <span>删除</span>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatHistoryItem
