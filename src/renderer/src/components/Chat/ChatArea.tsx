import React, { useState, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAuth } from '../../hooks/useAuth'
import { useSettings, themeUtils } from '../../share/share'

interface ChatAreaProps {
  currentSession?: string
  isConversationMode?: boolean
  selectedParentId?: string
}

const ChatArea: React.FC<ChatAreaProps> = ({
  currentSession,
  isConversationMode = false,
  selectedParentId = ''
}) => {
  const { user } = useAuth()
  const { settings, isDarkMode } = useSettings()
  
  // 获取实际应用的主题（处理 auto 模式）
  const actualTheme = themeUtils.getActualTheme(settings.theme)

    // 初始节点数据 - 使用实际主题和 isDarkMode
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'input',
      data: { label: '开始节点' },
      position: { x: 250, y: 25 },
      style: { 
        background: isDarkMode ? '#2a2b2c' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
      }
    },
    {
      id: '2',
      data: { label: '处理节点' },
      position: { x: 100, y: 125 },
      style: { 
        background: isDarkMode ? '#2a2b2c' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
      }
    },
    {
      id: '3',
      type: 'output',
      data: { label: '结束节点' },
      position: { x: 400, y: 125 },
      style: { 
        background: isDarkMode ? '#2a2b2c' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
      }
    },
  ]

  const initialEdges: Edge[] = []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    // 根据主题动态计算样式 - 使用 isDarkMode
  const flowStyles = useMemo(() => ({
    backgroundColor: isDarkMode ? '#1a1b1c' : '#f7fafc',
    color: isDarkMode ? '#ffffff' : '#000000',
  }), [isDarkMode])

  // 背景样式配置
  const backgroundConfig = useMemo(() => ({
    variant: 'dots' as BackgroundVariant,
    gap: 20,
    size: 1,
    color: isDarkMode ? '#4a5568' : '#e2e8f0',
  }), [isDarkMode])

  // 控件样式
  const controlsStyle = useMemo(() => ({
    background: isDarkMode ? '#2a2b2c' : '#ffffff',
    border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
    borderRadius: '8px',
  }), [isDarkMode])

  return (
    <div className="chat-area" style={{ height: '100vh', width: '100%' }}>
      {/* 头部信息面板 */}
            {isConversationMode && currentSession && (
        <div 
          className="conversation-header"
          style={{
            background: isDarkMode ? '#2a2b2c' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            borderBottom: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
            padding: '12px 16px',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>对话模式 - {currentSession}</span>
          {selectedParentId && (
            <span 
              className="parent-node-info"
              style={{
                background: isDarkMode ? '#4a5568' : '#e2e8f0',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              父节点: {selectedParentId}
            </span>
          )}
        </div>
      )}

      {/* React Flow 主界面 */}
      <div style={{ 
        height: isConversationMode && currentSession ? 'calc(100vh - 60px)' : '100vh',
        ...flowStyles 
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
        >
          {/* 控制面板 */}
          <Controls 
            style={controlsStyle}
            showZoom={true}
            showFitView={true}
            showInteractive={true}
          />

          {/* 背景 */}
          <Background {...backgroundConfig} />

          {/* 信息面板 */}
          <Panel 
            position="top-right"
            style={{
              background: isDarkMode ? '#2a2b2c' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
              borderRadius: '8px',
              padding: '12px',
              color: isDarkMode ? '#ffffff' : '#000000',
              fontSize: '12px',
            }}
          >
            <div>
              <div><strong>用户:</strong> {user?.username || '未登录'}</div>
              <div><strong>主题:</strong> {settings.theme} ({actualTheme})</div>
              <div><strong>模型:</strong> {settings.defaultModel}</div>
              <div><strong>节点数:</strong> {nodes.length}</div>
              <div><strong>连接数:</strong> {edges.length}</div>
            </div>
          </Panel>


          {/* 空状态提示 */}
          {nodes.length === 0 && (
            <Panel 
              position="center"
              style={{
                background: settings.theme === 'dark' ? '#2a2b2c' : '#ffffff',
                border: `1px solid ${settings.theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '24px',
                color: settings.theme === 'dark' ? '#a0aec0' : '#718096',
                textAlign: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>欢迎使用流程图模式</h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  当前没有节点，开始创建您的第一个流程图吧！
                </p>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* 自定义样式 */}
      <style jsx>{`
        .chat-area {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .react-flow__node {
          font-size: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .react-flow__node:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .react-flow__node.selected {
          box-shadow: 0 0 0 2px ${isDarkMode ? '#6366f1' : '#4f46e5'};
        }
        
        .react-flow__controls {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .react-flow__controls-button {
          background: ${isDarkMode ? '#374151' : '#f9fafb'};
          border: 1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'};
          color: ${isDarkMode ? '#ffffff' : '#374151'};
        }
        
        .react-flow__controls-button:hover {
          background: ${isDarkMode ? '#4b5563' : '#f3f4f6'};
        }
      `}</style>
    </div>
  )
}

export default ChatArea
