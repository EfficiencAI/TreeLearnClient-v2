import React from 'react'
import { NodeData } from '../ChatArea'

interface NodeTooltipProps {
  data: NodeData
  position: { x: number; y: number }
  isDarkMode: boolean
  onClose: () => void
}

const NodeTooltip: React.FC<NodeTooltipProps> = ({ 
  data, 
  position, 
  isDarkMode, 
  onClose 
}) => {
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x + 10,
    top: position.y - 10,
    background: isDarkMode ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
    borderRadius: '8px',
    padding: '16px',
    maxWidth: '400px',
    minWidth: '280px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    color: isDarkMode ? '#ffffff' : '#000000',
    fontSize: '13px',
    lineHeight: '1.5',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease-in-out'
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
      
      <div style={tooltipStyle}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '2px'
          }}
        >
          ×
        </button>

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
            节点ID: {data.parentId || 'root'}
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
