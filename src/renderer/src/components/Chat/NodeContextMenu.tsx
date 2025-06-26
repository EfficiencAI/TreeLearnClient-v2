import React, { useRef, useEffect } from 'react'

interface NodeContextMenuProps {
  x: number
  y: number
  nodeType: 'session' | 'conversation'
  nodeId: string
  isDarkMode: boolean
  onClose: () => void
  onAddNode: (nodeId: string) => void
  onUpdateNode: (nodeId: string) => void
  onDeleteNode?: (nodeId: string) => void
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  nodeType,
  nodeId,
  isDarkMode,
  onClose,
  onAddNode,
  onUpdateNode,
  onDeleteNode
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // 处理菜单位置，防止超出屏幕
  const getMenuStyle = () => {
    const menuWidth = 180
    const menuHeight = nodeType === 'session' ? 80 : 120
    
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
      zIndex: 1000
    }
  }

  const menuStyle = {
    ...getMenuStyle(),
    background: isDarkMode ? '#2d3748' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '160px',
    overflow: 'hidden'
  }

  const menuItemStyle = {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#f3f4f6'}`,
    color: isDarkMode ? '#ffffff' : '#374151',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleAddClick = () => {
    onAddNode(nodeId)
    onClose()
  }

  const handleUpdateClick = () => {
    onUpdateNode(nodeId)
    onClose()
  }

  const handleDeleteClick = () => {
    if (onDeleteNode) {
      onDeleteNode(nodeId)
      onClose()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div ref={menuRef} style={menuStyle} onClick={handleMenuClick}>
      <div
        style={{
          ...menuItemStyle,
          borderBottom: nodeType === 'session' ? 'none' : menuItemStyle.borderBottom
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDarkMode ? '#4a5568' : '#f7fafc'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
        onClick={handleAddClick}
      >
        <span>➕</span>
        <span>{nodeType === 'session' ? '提问' : '追问'}</span>
      </div>
      
      {nodeType === 'conversation' && (
        <div
            style={{
            ...menuItemStyle,
            borderBottom: nodeType === 'conversation' && onDeleteNode ? menuItemStyle.borderBottom : 'none'
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#4a5568' : '#f7fafc'
            }}
            onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            }}
            onClick={handleUpdateClick}
        >
            <span>🔄</span>
            <span>重问</span>
        </div>
      )}

      {nodeType === 'conversation' && onDeleteNode && (
        <div
          style={{
            ...menuItemStyle,
            borderBottom: 'none',
            color: isDarkMode ? '#f87171' : '#dc2626'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? '#7f1d1d' : '#fef2f2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
          onClick={handleDeleteClick}
        >
          <span>🗑️</span>
          <span>删除</span>
        </div>
      )}
    </div>
  )
}

export default NodeContextMenu
