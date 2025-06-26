// 右键菜单组件
const ContextMenu = () => {
  if (!showContextMenu) return null
  
  return (
    <div
      className="context-menu"
      style={{
        position: 'fixed',
        left: contextMenuPosition.x,
        top: contextMenuPosition.y,
        zIndex: 1000,
        background: isDarkMode ? '#2a2b2c' : '#ffffff',
        border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        padding: '8px 0',
        minWidth: '180px'
      }}
    >
      <div
        className="menu-item"
        onClick={handleAddConversationNode}
        style={{
          padding: '8px 16px',
          cursor: 'pointer',
          color: isDarkMode ? '#ffffff' : '#000000',
          backgroundColor: 'transparent',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <span>📝 新增对话节点</span>
        {isTextSelected && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
            将选中内容作为上下文
          </div>
        )}
      </div>
    </div>
  )
}

// 点击外部关闭菜单
useEffect(() => {
  const handleClickOutside = () => setShowContextMenu(false)
  if (showContextMenu) {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }
}, [showContextMenu])
