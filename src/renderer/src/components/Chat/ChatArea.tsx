import React, {
  useState, 
  useCallback, 
  useMemo, 
  useEffect, 
  useRef,
} from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  BackgroundVariant,
  NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAuth } from '../../hooks/useAuth'
import { useSettings, themeUtils } from '../../share/share'
import ContextMenu from '../Menu/ContextMenu'
import { sessionAPI, conversationAPI } from '../../api/API'

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

  // 创建会话节点的函数
  const createSessionNode = useCallback((sessionId: string): Node => {
    return {
      id: 'session-node',
      type: 'input',
      data: { 
        label: `会话: ${sessionId}`,
        sessionId: sessionId,
        isSessionNode: true
      },
      position: { x: 250, y: 25 },
      style: { 
        background: isDarkMode ? '#4a5568' : '#e6f3ff',
        color: isDarkMode ? '#ffffff' : '#000000',
        border: `2px solid ${isDarkMode ? '#6366f1' : '#4f46e5'}`,
        borderRadius: '8px',
        fontWeight: 'bold',
        minWidth: '200px',
        textAlign: 'center'
      },
      draggable: true,
      selectable: false, // 不可选择
      deletable: false   // 不可删除
    }
  }, [isDarkMode]);

  const getInitialNodes = useCallback((): Node[] => {
    const baseNodes: Node[] = []
    
    // 如果是会话模式且有会话ID，添加会话节点
    if (isConversationMode && currentSession) {
      baseNodes.push(createSessionNode(currentSession))
    }
    
    return baseNodes
  }, [isConversationMode, currentSession, createSessionNode])

  const initialEdges: Edge[] = []

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // 自定义节点变化处理函数，保护会话节点
  const handleNodesChange = useCallback((changes: any[]) => {
    // 过滤掉删除会话节点的操作
    const filteredChanges = changes.filter(change => {
      if (change.type === 'remove' && change.id === 'session-node') {
        return false // 阻止删除会话节点
      }
      return true
    })
    
    onNodesChange(filteredChanges)
  }, [onNodesChange])

    // 监听会话变化，动态更新会话节点
  useEffect(() => {
    if (isConversationMode && currentSession) {
      const sessionNode = createSessionNode(currentSession)
      
      setNodes(prevNodes => {
        // 检查是否已存在会话节点
        const hasSessionNode = prevNodes.some(node => node.id === 'session-node')
        
        if (!hasSessionNode) {
          // 添加会话节点到开头
          return [sessionNode, ...prevNodes]
        } else {
          // 更新现有会话节点
          return prevNodes.map(node => 
            node.id === 'session-node' ? sessionNode : node
          )
        }
      })
    } else {
      // 非会话模式时移除会话节点
      setNodes(prevNodes => prevNodes.filter(node => node.id !== 'session-node'))
    }
  }, [isConversationMode, currentSession, createSessionNode, setNodes])

  // 节点数据接口
  interface NodeData {
    label: string
    userMessage?: string
    message?: string
    parentId?: string
    selectedContext?: string
    isConversationNode?: boolean
    isSessionNode?: boolean
    sessionId?: string
    LinkedConversationNodesID?: string[]
    isLoading?: boolean
  }

  // 在现有状态后添加新的状态
  const [isLoadingNodes, setIsLoadingNodes] = useState(false)
  const [loadedNodeIds, setLoadedNodeIds] = useState<Set<string>>(new Set())

  // 递归获取对话节点 - 修复版本
  const fetchNodesRecursively = useCallback(async (
    parentNodeId: string, 
    parentPosition: { x: number; y: number }, 
    level: number = 0,
    processedNodes: Set<string> = new Set() // 新增：局部已处理节点集合
  ): Promise<{ nodes: Node[], edges: Edge[] }> => {
    // 防止无限递归的多重检查
    if (!currentSession || !user?.userId) {
      return { nodes: [], edges: [] }
    }

    // 检查是否已处理过此节点（防止循环引用）
    if (processedNodes.has(parentNodeId)) {
      return { nodes: [], edges: [] }
    }

    // 限制递归深度（防止过深递归）
    if (level > 10) {
      console.warn(`递归深度超过限制: ${level}`)
      return { nodes: [], edges: [] }
    }

    // 将当前节点标记为正在处理
    const newProcessedNodes = new Set([...processedNodes, parentNodeId])

    try {
      let linkedNodesId: string[] = []
      
      // 根据节点类型获取子节点ID列表
      if (parentNodeId === 'session-node') {
        const sessionResponse = await sessionAPI.get(user.userId, currentSession)
        if (sessionResponse.code === 200 && sessionResponse.obj?.LinkedConversationNodesID) {
          linkedNodesId = sessionResponse.obj.LinkedConversationNodesID || []
        }
      } else {
        const nodeResponse = await conversationAPI.get(parentNodeId, user.userId, currentSession)
        if (nodeResponse.code === 200 && nodeResponse.obj?.LinkedConversationNodesID) {
          linkedNodesId = nodeResponse.obj.LinkedConversationNodesID || []
        }
      }

      // 过滤掉已处理的节点ID
      linkedNodesId = linkedNodesId.filter(nodeId => !newProcessedNodes.has(nodeId))

      if (linkedNodesId.length === 0) {
        return { nodes: [], edges: [] }
      }

      const newNodes: Node[] = []
      const newEdges: Edge[] = []
      
      // 计算子节点位置
      const nodeSpacing = Math.max(300, 200 + level * 50) // 根据层级调整间距
      const levelSpacing = 150
      const startX = parentPosition.x - (linkedNodesId.length - 1) * nodeSpacing / 2
      
      // 串行处理节点（避免并发问题）
      for (let i = 0; i < linkedNodesId.length; i++) {
        const nodeId = linkedNodesId[i]
        
        try {
          const nodeResponse = await conversationAPI.get(nodeId, user.userId, currentSession)
          
          if (nodeResponse.code === 200 && nodeResponse.obj) {
            const nodeData = nodeResponse.obj
            const position = {
              x: startX + i * nodeSpacing,
              y: parentPosition.y + levelSpacing * (level + 1)
            }

            // 创建节点
            const newNode: Node<NodeData> = {
              id: nodeId,
              type: 'default',
              data: {
                label: (nodeData.userMessage || nodeData.message || `节点 ${nodeId}`).substring(0, 30) + '...',
                userMessage: nodeData.userMessage,
                message: nodeData.message,
                parentId: parentNodeId,
                isConversationNode: true,
                LinkedConversationNodesID: nodeData.LinkedConversationNodesID || []
              },
              position,
              style: {
                background: isDarkMode ? '#374151' : '#f9fafb',
                color: isDarkMode ? '#ffffff' : '#000000',
                border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
                borderRadius: '8px',
                padding: '10px',
                minWidth: '200px',
                maxWidth: '250px'
              }
            }

            newNodes.push(newNode)

            // 创建连接边
            const newEdge: Edge = {
              id: `edge_${parentNodeId}_${nodeId}`,
              source: parentNodeId,
              target: nodeId,
              style: { 
                stroke: isDarkMode ? '#6b7280' : '#9ca3af',
                strokeWidth: 2
              },
              animated: false
            }

            newEdges.push(newEdge)

            // 递归获取子节点（传递已处理节点集合）
            if (nodeData.LinkedConversationNodesID && 
                nodeData.LinkedConversationNodesID.length > 0 && 
                level < 8) { // 额外的深度限制
              const childResult = await fetchNodesRecursively(
                nodeId, 
                position, 
                level + 1, 
                newProcessedNodes
              )
              newNodes.push(...childResult.nodes)
              newEdges.push(...childResult.edges)
            }
          }
        } catch (error) {
          console.error(`获取节点 ${nodeId} 失败:`, error)
          // 继续处理其他节点，不中断整个流程
        }
      }

      return { nodes: newNodes, edges: newEdges }
    } catch (error) {
      console.error('递归获取节点失败:', error)
      return { nodes: [], edges: [] }
    }
  }, [currentSession, user?.userId, isDarkMode])

  // 加载会话的所有节点 - 修复版本
  const loadSessionNodes = useCallback(async () => {
    if (!isConversationMode || !currentSession || !user?.userId) return

    setIsLoadingNodes(true)

    try {
      // 获取会话节点位置
      const sessionNodePosition = { x: 250, y: 25 }
      
      // 递归获取所有节点
      const result = await fetchNodesRecursively('session-node', sessionNodePosition, 0)
      
      // 批量更新节点和边
      setNodes(prevNodes => {
        const sessionNode = prevNodes.find(node => node.id === 'session-node')
        const allNodes = sessionNode ? [sessionNode, ...result.nodes] : result.nodes
        console.log(`加载完成，共 ${allNodes.length} 个节点`)
        return allNodes
      })
      
      setEdges(result.edges)
      console.log(`加载完成，共 ${result.edges.length} 条边`)

    } catch (error) {
      console.error('加载会话节点失败:', error)
      // 发生错误时恢复到只有会话节点的状态
      setNodes(prevNodes => prevNodes.filter(node => node.id === 'session-node'))
      setEdges([])
    } finally {
      setIsLoadingNodes(false)
    }
  }, [isConversationMode, currentSession, user?.userId, fetchNodesRecursively, setNodes, setEdges])

  // 监听会话变化，动态更新会话节点并加载对话节点
  useEffect(() => {
    if (isConversationMode && currentSession) {
      const sessionNode = createSessionNode(currentSession)

      setNodes(prevNodes => {
        // 检查是否已存在会话节点
        const hasSessionNode = prevNodes.some(node => node.id === 'session-node')

        if (!hasSessionNode) {
          // 添加会话节点到开头
          return [sessionNode]
        } else {
          // 更新现有会话节点，清除其他节点
          return [sessionNode]
        }
      })

      // 清空边
      setEdges([])
      
      // 加载对话节点
      loadSessionNodes()
    } else {
      // 非会话模式时移除所有节点
      setNodes([])
      setEdges([])
    }
  }, [isConversationMode, currentSession, createSessionNode, setNodes, setEdges, loadSessionNodes])

  const customStyles = useMemo(() => ({
    chatArea: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  }), [])

  // 动态生成CSS字符串
  const dynamicStyles = useMemo(() => `
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
    
    .react-flow__node[data-id="session-node"] {
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
      50% { box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5); }
      100% { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
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
  `, [isDarkMode])

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
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
          onNodesDelete={(nodesToDelete) => {
            // 阻止删除会话节点
            const filteredNodes = nodesToDelete.filter(node => node.id !== 'session-node')
            if (filteredNodes.length > 0) {
              // 这里可以添加其他节点的删除逻辑
              console.log('删除节点:', filteredNodes)
            }
          }}
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
              {isLoadingNodes && (
                <div style={{ color: isDarkMode ? '#fbbf24' : '#f59e0b' }}>
                  <strong>状态:</strong> 加载中...
                </div>
              )}
            </div>
          </Panel>

          {/* 空状态提示 */}
          {nodes.length === 0 && (
            <Panel 
              position="top-center"
              style={{
                background: settings.theme === 'dark' ? '#2a2b2c' : '#ffffff',
                border: `1px solid ${settings.theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '24px',
                color: settings.theme === 'dark' ? '#a0aec0' : '#718096',
                textAlign: 'center',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10
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

      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />

    </div>
  )
}

export default ChatArea
