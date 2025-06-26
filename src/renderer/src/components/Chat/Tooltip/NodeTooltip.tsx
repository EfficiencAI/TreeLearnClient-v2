import React from 'react'
import { NodeData } from '../ChatArea'

interface NodeTooltipProps {
  data: NodeData
  position: { x: number; y: number }
  isDarkMode: boolean
  onClose: () => void
  onPin?: () => void           // 新增：固定/取消固定回调
  isPinned?: boolean          // 新增：是否已固定
  onMouseEnter?: () => void   // 新增：鼠标进入回调
  onMouseLeave?: () => void   // 新增：鼠标离开回调
}


const NodeTooltip: React.FC<NodeTooltipProps> = ({ 
  data,
  position,
  isDarkMode,
  onClose,
  onPin,
  isPinned = false,
  onMouseEnter,
  onMouseLeave
}) => {
  // 固定模式下的样式调整
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x + 10,
    top: position.y - 10,
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: `2px solid ${isPinned 
      ? (isDarkMode ? '#6366f1' : '#4f46e5')  // 固定时使用强调色边框
      : (isDarkMode ? '#4b5563' : '#e5e7eb')
    }`,
    borderRadius: '8px',
    padding: '16px',
    maxWidth: '800px',
    minWidth: '280px',
    maxHeight: '600px',
    overflowY: 'auto',
    boxShadow: isPinned 
      ? '0 8px 25px rgba(0, 0, 0, 0.25)'      // 固定时增强阴影
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    fontSize: '14px',
    lineHeight: '1.5',
    color: isDarkMode ? '#ffffff' : '#374151'
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `
      }} />
      
      <div 
        style={tooltipStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`node-tooltip-content ${isPinned ? 'pinned-tooltip' : ''}`}
        >
        {/* 标题栏 - 添加固定按钮 */}
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
        }}>
            <span style={{
            fontWeight: 'bold',
            fontSize: '16px',
            color: isDarkMode ? '#ffffff' : '#374151'
            }}>
            {data.isSessionNode ? '会话节点' : '对话节点'}
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
            {/* 固定/取消固定按钮 */}
            {onPin && (
                <button
                onClick={onPin}
                style={{
                    background: isPinned 
                    ? (isDarkMode ? '#6366f1' : '#4f46e5')
                    : 'transparent',
                    border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: isPinned 
                    ? '#ffffff' 
                    : (isDarkMode ? '#d1d5db' : '#6b7280'),
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                }}
                title={isPinned ? '取消固定' : '固定显示'}
                >
                {isPinned ? '📌' : '📍'}
                </button>
            )}
            
            {/* 关闭按钮 */}
            <button
                onClick={onClose}
                style={{
                background: 'transparent',
                border: 'none',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px',
                borderRadius: '2px',
                transition: 'color 0.2s'
                }}
                title="关闭"
            >
                ✕
            </button>
            </div>
        </div>

        {/* 节点信息 */}
        <div style={{ marginBottom: '12px' }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: isDarkMode ? '#f3f4f6' : '#111827',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🔗 节点详情
          </h4>
          <div style={{ 
            fontSize: '12px', 
            color: isDarkMode ? '#9ca3af' : '#6b7280' 
          }}>
            节点ID: {data.nodeId || 'root'}
          </div>
        </div>

        {/* 用户消息 */}
        {data.userMessage && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '6px',
              color: isDarkMode ? '#60a5fa' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              👤 用户问题
            </div>
            <div style={{
              background: isDarkMode ? '#374151' : '#f9fafb',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {data.userMessage}
            </div>
          </div>
        )}

        {/* AI回答 */}
        {data.message && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '6px',
              color: isDarkMode ? '#34d399' : '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🤖 AI回答
            </div>
            <div style={{
              background: isDarkMode ? '#064e3b' : '#ecfdf5',
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${isDarkMode ? '#047857' : '#a7f3d0'}`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {data.message}
            </div>
          </div>
        )}

        {/* 子节点信息 */}
        {data.LinkedConversationNodesID && data.LinkedConversationNodesID.length > 0 && (
          <div>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '6px',
              color: isDarkMode ? '#fbbf24' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🌿 子节点 ({data.LinkedConversationNodesID.length})
            </div>
            <div style={{
              background: isDarkMode ? '#451a03' : '#fef3c7',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${isDarkMode ? '#92400e' : '#fcd34d'}`,
              fontSize: '11px'
            }}>
              {data.LinkedConversationNodesID.join(', ')}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default NodeTooltip
