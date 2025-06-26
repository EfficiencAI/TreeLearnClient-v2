import React, { useState, useRef, useEffect } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  nodeId?: string
  nodeType?: string
  selectedText?: string
  onAddConversationNode: (userMessage: string) => void
  onClose: () => void
  isDarkMode: boolean
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  nodeId,
  nodeType,
  selectedText,
  onAddConversationNode,
  onClose,
  isDarkMode
}) => {
  const [showInput, setShowInput] = useState(false)
  const [userMessage, setUserMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 处理菜单位置，防止超出屏幕
  const getMenuStyle = () => {
    const menuWidth = 250
    const menuHeight = showInput ? 200 : 100
    
    let adjustedX = x
    let adjustedY = y
    
    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10
    }
    
    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10
    }
    
    return {
      position: 'fixed' as const,
      left: adjustedX,
      top: adjustedY,
      zIndex: 1000,
      background: isDarkMode ? '#374151' : '#ffffff',
      border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '250px',
      overflow: 'hidden'
    }
  }

  const menuItemStyle = {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#f3f4f6'}`,
    color: isDarkMode ? '#ffffff' : '#374151',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  }

  const handleAddClick = () => {
    setShowInput(true)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleSubmit = () => {
    if (userMessage.trim()) {
      onAddConversationNode(userMessage.trim())
      setUserMessage('')
      setShowInput(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setShowInput(false)
      setUserMessage('')
    }
  }

  // 阻止菜单内的点击事件冒泡
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={menuRef} style={getMenuStyle()} onClick={handleMenuClick}>
      {!showInput ? (
        <>
          <div
            style={menuItemStyle}
            onClick={handleAddClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              新增对话节点
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {nodeId ? `在 ${nodeId} 节点下创建` : '创建新的对话节点'}
            </div>
          </div>
          
          {selectedText && (
            <div style={{ 
              ...menuItemStyle, 
              borderBottom: 'none',
              backgroundColor: isDarkMode ? '#2d3748' : '#f7fafc'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                选中的文本：
              </div>
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.8,
                maxHeight: '60px',
                overflow: 'auto',
                padding: '4px',
                background: isDarkMode ? '#1a202c' : '#edf2f7',
                borderRadius: '4px'
              }}>
                {selectedText.length > 100 ? `${selectedText.substring(0, 100)}...` : selectedText}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '16px' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: isDarkMode ? '#ffffff' : '#374151'
          }}>
            输入对话内容
          </div>
          
          {selectedText && (
            <div style={{ 
              fontSize: '12px', 
              marginBottom: '8px',
              padding: '8px',
              background: isDarkMode ? '#2d3748' : '#f7fafc',
              borderRadius: '4px',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`
            }}>
              <strong>包含上下文：</strong> {selectedText.substring(0, 50)}...
            </div>
          )}
          
          <textarea
            ref={inputRef}
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入您的问题或对话内容..."
            style={{
              width: '100%',
              height: '80px',
              padding: '8px',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '4px',
              background: isDarkMode ? '#1f2937' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#374151',
              resize: 'none',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px', 
            marginTop: '12px' 
          }}>
            <button
              onClick={() => {
                setShowInput(false)
                setUserMessage('')
              }}
              style={{
                padding: '6px 12px',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '4px',
                background: 'transparent',
                color: isDarkMode ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!userMessage.trim()}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                background: userMessage.trim() 
                  ? (isDarkMode ? '#3b82f6' : '#2563eb')
                  : (isDarkMode ? '#374151' : '#e5e7eb'),
                color: userMessage.trim() ? '#ffffff' : (isDarkMode ? '#6b7280' : '#9ca3af'),
                cursor: userMessage.trim() ? 'pointer' : 'not-allowed',
                fontSize: '12px'
              }}
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContextMenu
