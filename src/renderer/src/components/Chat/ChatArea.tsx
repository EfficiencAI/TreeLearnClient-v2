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
import NodeTooltip from './Tooltip/NodeTooltip'
import { 
  sessionAPI, 
  conversationAPI, 
  ApiResponse, 
  ConversationNodeData, 
  SessionData, 
  ConversationRequestParams
} from '../../api/API'
import NodeContextMenu from './NodeContextMenu'


interface ChatAreaProps {
  currentSession?: string
  isConversationMode?: boolean
  selectedParentId?: string
}

// 节点数据接口
export interface NodeData {
  label: string
  userMessage?: string
  message?: string
  nodeId: string
  parentId?: string
  selectedContext?: string
  isConversationNode?: boolean
  isSessionNode?: boolean
  sessionId?: string
  LinkedConversationNodesID?: string[]
  isLoading?: boolean
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

  // 在现有状态后添加新的状态
  const [isLoadingNodes, setIsLoadingNodes] = useState(false)

  // 格式化节点显示内容
  const formatNodeContent = useCallback((userMessage?: string, aiMessage?: string): string => {
    const maxLength = 60 // 每部分最大显示长度
    
    let content = ''
    
    // 添加用户问题
    if (userMessage) {
      const truncatedUser = userMessage.length > maxLength 
        ? userMessage.substring(0, maxLength) + '...' 
        : userMessage
      content += `👤 ${truncatedUser}`
    }
    
    // 添加AI回答
    if (aiMessage) {
      const truncatedAI = aiMessage.length > maxLength 
        ? aiMessage.substring(0, maxLength) + '...' 
        : aiMessage
      if (content) content += '\n\n'
      content += `🤖 ${truncatedAI}`
    }
    
    // 如果都没有，显示默认内容
    if (!content) {
      content = '📝 对话节点'
    }
    
    return content
  }, [])

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
        const sessionResponse: ApiResponse<SessionData> = await sessionAPI.get(user.userId, currentSession)
        if (sessionResponse.code === 200 && sessionResponse.obj?.LinkedConversationNodesID) {
          linkedNodesId = sessionResponse.obj.LinkedConversationNodesID || []
        }
      } else {
        const nodeResponse: ApiResponse<ConversationNodeData> = await conversationAPI.get(parentNodeId, user.userId, currentSession)
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
      
      // 计算子节点位置 - 优化版本
      const nodeSpacing = Math.max(380, 280 + level * 60) // 增加间距适应更大节点
      const levelSpacing = 180 // 增加垂直间距
      const startX = parentPosition.x - (linkedNodesId.length - 1) * nodeSpacing / 2

      // 串行处理节点（避免并发问题）
      for (let i = 0; i < linkedNodesId.length; i++) {
        const nodeId = linkedNodesId[i]
        
        try {
          const nodeResponse: ApiResponse<ConversationNodeData> = await conversationAPI.get(nodeId, user.userId, currentSession)
          
          if (nodeResponse.code === 200 && nodeResponse.obj) {
            const nodeData = nodeResponse.obj
            const position = {
              x: startX + i * nodeSpacing,
              y: parentPosition.y + levelSpacing * (level + 1)
            }

            console.log('nodeData', nodeData)

            // 创建节点 - 修改显示内容
            const newNode: Node<NodeData> = {
              id: nodeId,
              type: 'default',
              data: {
                label: formatNodeContent(nodeData.UserMessage, nodeData.AIMessage),
                userMessage: nodeData.UserMessage,
                message: nodeData.AIMessage,
                nodeId: nodeId,
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
                padding: '12px',
                minWidth: '280px',
                maxWidth: '350px',
                fontSize: '12px',
                lineHeight: '1.4'
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

  // 悬停提示状态
  const [hoveredNode, setHoveredNode] = useState<{
    id: string
    position: { x: number; y: number }
    data: NodeData
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })


  // 节点鼠标事件处理 - 增强版本
  const onNodeMouseEnter: NodeMouseHandler = useCallback((event, node) => {
    if (node.data.isConversationNode || node.data.isSessionNode) {

      setHoveredNode({
        id: node.id,
        position: { x: event.clientX, y: event.clientY },
        data: node.data
      })
      
      setTooltipPosition({ 
        x: event.clientX, 
        y: event.clientY 
      })
    }
  }, [])

  // 在现有状态后添加固定 tooltip 相关状态
  const [isMouseOverTooltip, setIsMouseOverTooltip] = useState(false)

  // 在现有状态后添加固定 tooltip 状态
  const [pinnedTooltip, setPinnedTooltip] = useState<{
    id: string
    position: { x: number; y: number }
    data: NodeData
  } | null>(null)

  // 改进的鼠标离开处理
  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    if (!pinnedTooltip) {
      setTimeout(() => {
        // 检查鼠标是否在tooltip区域或者tooltip被固定
        if (!isMouseOverTooltip && !pinnedTooltip) {
          setHoveredNode(null)
        }
      }, 200)
    }
  }, [pinnedTooltip, isMouseOverTooltip])

  // 添加固定/取消固定处理函数
  const handlePinTooltip = useCallback(() => {
    if (hoveredNode) {
      if (pinnedTooltip && pinnedTooltip.id === hoveredNode.id) {
        // 取消固定
        setPinnedTooltip(null)
      } else {
        // 固定当前tooltip
        setPinnedTooltip(hoveredNode)
        setHoveredNode(null) // 清除悬停状态
      }
    }
  }, [hoveredNode, pinnedTooltip])

  const handleCloseTooltip = useCallback(() => {
    setHoveredNode(null)
    setPinnedTooltip(null)
  }, [])

  // 添加节点点击事件处理
  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    if (node.data.isConversationNode || node.data.isSessionNode) {
      // 点击节点时固定tooltip
      const nodeTooltipData = {
        id: node.id,
        position: { x: event.clientX, y: event.clientY },
        data: node.data
      }
      
      if (pinnedTooltip && pinnedTooltip.id === node.id) {
        // 如果点击的是已固定的节点，则取消固定
        setPinnedTooltip(null)
      } else {
        // 固定新的tooltip
        setPinnedTooltip(nodeTooltipData)
        setHoveredNode(null) // 清除悬停状态
      }
    }
  }, [pinnedTooltip])

  // 鼠标移动时更新tooltip位置
  const onNodeMouseMove: NodeMouseHandler = useCallback((event, node) => {
    if (hoveredNode && hoveredNode.id === node.id) {
      setTooltipPosition({ 
        x: event.clientX, 
        y: event.clientY 
      })
    }
  }, [hoveredNode])

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    nodeId: string
    nodeType: 'session' | 'conversation'
  } | null>(null)

  // 右键菜单事件处理
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
    event.preventDefault()
    event.stopPropagation()
    
    const nodeType = node.id === 'session-node' ? 'session' : 'conversation'
    
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
      nodeType
    })
    
    // 隐藏tooltip
    setHoveredNode(null)
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // 节点相关状态
  const [newNodeDialog, setNewNodeDialog] = useState<{
    visible: boolean
    parentNodeId: string
    nodeType: 'question' | 'followup'
    selectedText?: string
    contextStartIdx?: number
    contextEndIdx?: number
    // AI回答的完整文本
    aiResponseText?: string
    // 更新模式相关字段
    isUpdateMode?: boolean
    updateNodeId?: string
    originalUserMessage?: string
  } | null>(null)

  // 文本选择相关状态
  const [textSelection, setTextSelection] = useState<{
    selectedText: string
    startIdx: number
    endIdx: number
  } | null>(null)

  const [isCreatingNode, setIsCreatingNode] = useState(false)
  const [userInput, setUserInput] = useState('')

  // 处理流式响应
  const handleStreamResponse = useCallback(async (stream: ReadableStream<Uint8Array>, nodeId: string, userMessage: string) => {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let aiResponse = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        // 解码流数据
        const chunk = decoder.decode(value, { stream: true })
        aiResponse += chunk

        // 实时更新节点内容
        setNodes(prevNodes => 
          prevNodes.map(node => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: formatNodeContent(userMessage, aiResponse + '▌'), // 添加光标效果
                  message: aiResponse,
                  isLoading: true
                }
              }
            }
            return node
          })
        )
      }

      // 流式响应完成，更新最终状态
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: formatNodeContent(userMessage, aiResponse),
                message: aiResponse,
                isLoading: false
              },
              style: {
                ...node.style,
                border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
                animation: 'none'
              }
            }
          }
          return node
        })
      )

      // 只在非更新模式下添加连接边
      if (!newNodeDialog?.isUpdateMode) {
        const newEdge: Edge = {
          id: `edge_${newNodeDialog?.parentNodeId}_${nodeId}`,
          source: newNodeDialog?.parentNodeId || '',
          target: nodeId,
          style: { 
            stroke: isDarkMode ? '#6b7280' : '#9ca3af',
            strokeWidth: 2
          },
          animated: false
        }

        setEdges(prevEdges => [...prevEdges, newEdge])
      }

      console.log(newNodeDialog?.isUpdateMode ? '节点更新完成:' : '节点创建完成:', nodeId)

    } catch (error) {
      console.error('处理流式响应失败:', error)
      throw error
    } finally {
      reader.releaseLock()
    }
  }, [setNodes, setEdges, formatNodeContent, isDarkMode, newNodeDialog])

  // 创建临时加载节点
  const createTemporaryNode = useCallback((nodeId: string, parentId: string, userMessage: string): Node<NodeData> => {
    // 计算新节点位置
    const parentNode = nodes.find(node => node.id === parentId)
    const parentPosition = parentNode?.position || { x: 250, y: 25 }
    
    // 计算子节点数量以确定位置
    const siblingCount = nodes.filter(node => 
      edges.some(edge => edge.source === parentId && edge.target === node.id)
    ).length
    
    const position = {
      x: parentPosition.x + (siblingCount * 300),
      y: parentPosition.y + 200
    }

    return {
      id: nodeId,
      type: 'default',
      data: {
        label: `👤 ${userMessage}\n\n🤖 正在思考中...`,
        userMessage,
        message: '',
        nodeId: nodeId,
        parentId,
        isConversationNode: true,
        isLoading: true
      },
      position,
      style: {
        background: isDarkMode ? '#374151' : '#f9fafb',
        color: isDarkMode ? '#ffffff' : '#000000',
        border: `2px solid ${isDarkMode ? '#6366f1' : '#4f46e5'}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '280px',
        maxWidth: '350px',
        fontSize: '12px',
        lineHeight: '1.4',
        animation: 'pulse 1.5s infinite'
      }
    }
  }, [nodes, edges, isDarkMode])

  // 处理新增节点请求
  const handleAddNode = useCallback((nodeId: string) => {
    console.log('准备添加节点，父节点ID:', nodeId)
    
    // 判断节点类型
    const nodeType = nodeId === 'session-node' ? 'question' : 'followup'
    
    // 获取父节点的AI回答文本（用于追问模式）
    let aiResponseText = ''
    if (nodeType === 'followup') {
      const parentNode = nodes.find(node => node.id === nodeId)
      aiResponseText = parentNode?.data?.message || ''
    }
    
    setNewNodeDialog({
      visible: true,
      parentNodeId: nodeId,
      nodeType,
      contextStartIdx: nodeType === 'question' ? undefined : 0,
      contextEndIdx: nodeType === 'question' ? undefined : -1,
      aiResponseText
    })
    
    // 重置文本选择状态
    setTextSelection(null)
  }, [nodes])

  // 处理用户输入变化
  const handleUserInputChange = useCallback((value: string) => {
    setUserInput(value)
  }, [])

  // 处理文本选择
  const handleTextSelection = useCallback((selectedText: string, startIdx: number, endIdx: number) => {
    setTextSelection({
      selectedText,
      startIdx,
      endIdx
    })
    
    // 同时更新对话框状态
    setNewNodeDialog(prev => prev ? {
      ...prev,
      selectedText,
      contextStartIdx: startIdx,
      contextEndIdx: endIdx
    } : null)
  }, [])

  // 重置文本选择
  const handleResetSelection = useCallback(() => {
    setTextSelection(null)
    setNewNodeDialog(prev => prev ? {
      ...prev,
      selectedText: '',
      contextStartIdx: 0,
      contextEndIdx: -1
    } : null)
  }, [])

  // 文本选择组件
  const TextSelectionArea = useCallback(({ 
    text, 
    onTextSelect,
    canSelect: canSelect
  }: { 
    text: string
    onTextSelect: (selectedText: string, startIdx: number, endIdx: number) => void 
    canSelect: boolean
  }) => {
    const textRef = useRef<HTMLDivElement>(null)
    
    const handleMouseUp = useCallback(() => {
      if (!textRef.current) return

      if (!canSelect) return
      
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return
      
      const selectedText = selection.toString().trim()
      
      if (!selectedText) return
      
      // 计算选中文本在原文中的位置
      const containerText = textRef.current.textContent || ''
      const startIdx = containerText.indexOf(selectedText)
      const endIdx = startIdx + selectedText.length - 1
      
      if (startIdx >= 0) {
        onTextSelect(selectedText, startIdx, endIdx)
      }
    }, [onTextSelect])
    
    return (
      <div
        ref={textRef}
        className="text-selection-area"
        onMouseUp={handleMouseUp}
        style={{
          padding: '16px',
          background: isDarkMode ? '#1f2937' : '#f8fafc',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6',
          maxHeight: '200px',
          overflowY: 'auto',
          userSelect: 'text',
          cursor: canSelect ? 'text' : 'not-allowed',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          msUserSelect: canSelect ? 'text' : 'none',
          opacity: canSelect ? 1 : 0.6,
        }}
      >
        {text || '暂无AI回答内容'}
      </div>
    )
  }, [isDarkMode])

  // 删除节点的所有子节点
  const deleteChildNodes = useCallback(async (nodeId: string): Promise<boolean> => {
    if (!user?.userId || !currentSession) {
      return false
    }

    try {
      // 获取节点信息
      const nodeResponse = await conversationAPI.get(nodeId, user.userId, currentSession)
      
      if (nodeResponse.code === 200 && nodeResponse.obj?.LinkedConversationNodesID) {
        const childIds = nodeResponse.obj.LinkedConversationNodesID
        
        // 串行删除所有子节点（包括它们的子节点）
        for (const childId of childIds) {
          const deleteResponse = await conversationAPI.delete(childId, user.userId, currentSession)
          if (deleteResponse.code !== 200) {
            console.error(`删除子节点 ${childId} 失败:`, deleteResponse.msg)
            return false
          }
        }
      }
      
      return true
    } catch (error) {
      console.error('删除子节点时发生错误:', error)
      return false
    }
  }, [user?.userId, currentSession])

  // 确认创建新节点或更新节点
  const handleConfirmAddNode = useCallback(async () => {
    if (!newNodeDialog || !user?.userId || !currentSession || !userInput.trim()) {
      console.error('操作信息不完整')
      return
    }

    setIsCreatingNode(true)

    try {
      const { parentNodeId, nodeType, contextStartIdx, contextEndIdx, isUpdateMode, updateNodeId } = newNodeDialog
      
      if (isUpdateMode && updateNodeId) {
        // 更新模式
        console.log('更新节点:', updateNodeId)
        
        // 先删除子节点
        const deleteSuccess = await deleteChildNodes(updateNodeId)
        if (!deleteSuccess) {
          throw new Error('删除子节点失败')
        }
        
        // 准备更新请求参数
        const requestParams = {
          userId: user.userId,
          sessionName: currentSession,
          conversationNodeId: updateNodeId,
          parentId: '', // 更新时不需要修改父节点关系
          userMessage: userInput.trim(),
          contextStartIdx: String(contextStartIdx || 0),
          contextEndIdx: String(contextEndIdx || -1),
          message: userInput.trim(),
          apikey: settings.apiKey || '',
          baseurl: settings.baseUrl || '',
          modelName: settings.modelName || settings.defaultModel,
          systemPrompt: settings.systemPrompt || '你是一个有用的AI助手',
          mcpUrls: []
        }

        console.log('发送更新请求参数:', requestParams)

        // 先更新UI中的节点状态为加载中
        setNodes(prevNodes => 
          prevNodes.map(node => {
            if (node.id === updateNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: `👤 ${userInput.trim()}\n\n🤖 正在重新思考中...`,
                  userMessage: userInput.trim(),
                  message: '',
                  isLoading: true
                },
                style: {
                  ...node.style,
                  border: `2px solid ${isDarkMode ? '#6366f1' : '#4f46e5'}`,
                  animation: 'pulse 1.5s infinite'
                }
              }
            }
            return node
          })
        )

        // 发送流式更新请求
        const stream = await conversationAPI.update(requestParams)
        
        if (stream) {
          // 处理流式响应
          await handleStreamResponse(stream, updateNodeId, userInput.trim())
          
          // 更新成功后重新加载会话数据以确保一致性
          console.log('🎉 节点更新成功! 重新加载会话数据...')
          
          // 重新加载整个会话的节点数据
          await loadSessionNodes()
          
          // 显示成功提示
          const successMessage = document.createElement('div')
          successMessage.innerHTML = '🎉 重新提问成功！会话已更新'
          successMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${isDarkMode ? '#065f46' : '#d1fae5'};
            color: ${isDarkMode ? '#ffffff' : '#065f46'};
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            animation: slideInRight 0.3s ease-out;
          `
          document.body.appendChild(successMessage)
          
          // 3秒后自动移除
          setTimeout(() => {
            if (successMessage.parentNode) {
              successMessage.remove()
            }
          }, 3000)
        } else {
          throw new Error('未能获取到流式响应')
        }
        
      } else {
        // 原有的新增逻辑保持不变

        let actualParentId: string | number
        if (parentNodeId === 'session-node') {
          actualParentId = '-1'
        } else {
          const parentNode = nodes.find(node => node.id === parentNodeId)
          actualParentId = parentNode?.id || parentNodeId
        }

        conversationAPI.register(user.userId, currentSession, actualParentId).then((response: any) => {
          if(response.code === 200){
            const newNodeId = response.obj
            
            const requestParams = {
              userId: user.userId,
              sessionName: currentSession,
              conversationNodeId: newNodeId,
              parentId: actualParentId,
              userMessage: userInput.trim(),
              contextStartIdx: nodeType === 'question' ? '' : String(contextStartIdx || 0),
              contextEndIdx: nodeType === 'question' ? '' : String(contextEndIdx || -1),
              message: userInput.trim(),
              apikey: settings.apiKey || '',
              baseurl: settings.baseUrl || '',
              modelName: settings.modelName || settings.defaultModel,
              systemPrompt: settings.systemPrompt || '你是一个有用的AI助手',
              mcpUrls: []
            }

            console.log(`创建${nodeType === 'question' ? '提问' : '追问'}节点:`, {
              nodeId: newNodeId,
              parentId: parentNodeId,
              userMessage: userInput.trim(),
              contextRange: nodeType === 'followup' ? `${contextStartIdx}-${contextEndIdx}` : 'N/A'
            })

            const tempNode = createTemporaryNode(newNodeId, parentNodeId, userInput.trim())
            setNodes(prevNodes => [...prevNodes, tempNode])

            console.log('发送请求参数:', requestParams)

            handleAddNodeStream(requestParams, newNodeId)
          }
          
        })
      }

    } catch (error) {
      console.error('操作失败:', error)
      
      if (newNodeDialog.isUpdateMode) {
        // 更新失败时恢复节点状态
        setNodes(prevNodes => 
          prevNodes.map(node => {
            if (node.id === newNodeDialog.updateNodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  label: formatNodeContent(newNodeDialog.originalUserMessage, node.data.message),
                  userMessage: newNodeDialog.originalUserMessage,
                  isLoading: false
                },
                style: {
                  ...node.style,
                  border: `1px solid ${isDarkMode ? '#ef4444' : '#dc2626'}`, // 红色边框表示错误
                  animation: 'none'
                }
              }
            }
            return node
          })
        )
        
        // 显示错误提示
        const errorMessage = document.createElement('div')
        errorMessage.innerHTML = '❌ 重新提问失败，请重试'
        errorMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${isDarkMode ? '#7f1d1d' : '#fef2f2'};
          color: ${isDarkMode ? '#ffffff' : '#7f1d1d'};
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 3000;
          animation: slideInRight 0.3s ease-out;
        `
        document.body.appendChild(errorMessage)
        
        setTimeout(() => {
          if (errorMessage.parentNode) {
            errorMessage.remove()
          }
        }, 5000)
      } else {
        // 新增失败时移除临时节点
        setNodes(prevNodes => prevNodes.filter(node => !node.data.isLoading))
      }
    } finally {
      setIsCreatingNode(false)
      setNewNodeDialog(null)
      setUserInput('')
    }
  }, [newNodeDialog, user?.userId, currentSession, userInput, settings, setNodes, deleteChildNodes, handleStreamResponse, createTemporaryNode, formatNodeContent, isDarkMode])

  // 取消创建节点
  const handleCancelAddNode = useCallback(() => {
    setNewNodeDialog(null)
    setUserInput('')
  }, [])

  async function handleAddNodeStream(requestParams: ConversationRequestParams, newNodeId: string) {
    const stream = await conversationAPI.add(requestParams)
    if (stream) {
      await handleStreamResponse(stream, newNodeId, userInput.trim())
    } else {
      throw new Error('未能获取到流式响应')
    }
  }

  // 更新确认状态
  const [updateConfirm, setUpdateConfirm] = useState<{
    visible: boolean
    nodeId: string
    originalUserMessage: string
    originalAIMessage: string
    childCount: number
    isUpdating?: boolean
  } | null>(null)

  // 处理更新节点
  const handleUpdateNode = useCallback(async (nodeId: string) => {
    console.log('更新节点，节点ID:', nodeId)
    
    if (!user?.userId || !currentSession) {
      console.error('用户信息或会话信息缺失')
      return
    }

    try {
      // 获取要更新的节点信息
      const nodeResponse = await conversationAPI.get(nodeId, user.userId, currentSession)
      
      if (nodeResponse.code === 200 && nodeResponse.obj) {
        const nodeData = nodeResponse.obj
        
        // 检查是否有子节点
        const hasChildren = nodeData.LinkedConversationNodesID && nodeData.LinkedConversationNodesID.length > 0
        
        if (hasChildren) {
          // 显示警告对话框
          setUpdateConfirm({
            visible: true,
            nodeId,
            originalUserMessage: nodeData.UserMessage || '',
            originalAIMessage: nodeData.AIMessage || '',
            childCount: nodeData.LinkedConversationNodesID?.length || 0
          })
        } else {
          // 没有子节点，直接进入更新模式
          openUpdateDialog(nodeId, nodeData.UserMessage || '', nodeData.AIMessage || '')
        }
      } else {
        console.error('获取节点信息失败:', nodeResponse.msg)
      }
    } catch (error) {
      console.error('获取节点信息时发生错误:', error)
    }
  }, [user?.userId, currentSession])

  // 打开更新对话框
  const openUpdateDialog = useCallback((nodeId: string, originalUserMessage: string, aiResponseText: string) => {
    setNewNodeDialog({
      visible: true,
      parentNodeId: nodeId.length == 1 ? '-1' : nodeId.substring(0, nodeId.length - 1),
      nodeType: 'followup', // 更新模式使用追问类型（支持上下文选择）
      aiResponseText,
      isUpdateMode: true,
      updateNodeId: nodeId,
      originalUserMessage,
      contextStartIdx: 0,
      contextEndIdx: -1
    })
    
    // 重置文本选择状态
    setTextSelection(null)
    // 设置原始用户输入
    setUserInput(originalUserMessage)
  }, [])

  // 确认更新节点
  const handleConfirmUpdate = useCallback(() => {
    if (!updateConfirm) return
    
    const { nodeId, originalUserMessage, originalAIMessage } = updateConfirm
    openUpdateDialog(nodeId, originalUserMessage, originalAIMessage)
    setUpdateConfirm(null)
  }, [updateConfirm, openUpdateDialog])

  // 取消更新
  const handleCancelUpdate = useCallback(() => {
    setUpdateConfirm(null)
  }, [])

  // 删除确认状态
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean
    nodeId: string
    nodeName: string
    isDeleting?: boolean
  } | null>(null)

  // 递归获取所有子节点ID（包括子节点的子节点）
  const getAllChildNodeIds = useCallback((nodeId: string, allNodes: Node[]): string[] => {
    const childIds: string[] = []
    
    // 找到当前节点
    const currentNode = allNodes.find(node => node.id === nodeId)
    if (!currentNode?.data?.LinkedConversationNodesID) {
      return childIds
    }
    
    // 获取直接子节点
    const directChildren = currentNode.data.LinkedConversationNodesID || []
    
    // 递归获取所有子节点
    for (const childId of directChildren) {
      childIds.push(childId)
      // 递归获取子节点的子节点
      const grandChildren = getAllChildNodeIds(childId, allNodes)
      childIds.push(...grandChildren)
    }
    
    return childIds
  }, [])

  // 从边数据中获取子节点ID（作为备用方案）
  const getChildNodeIdsFromEdges = useCallback((nodeId: string, allEdges: Edge[]): string[] => {
    const childIds: string[] = []
    
    // 找到以当前节点为源的所有边
    const directChildren = allEdges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target)
    
    // 递归获取所有子节点
    for (const childId of directChildren) {
      childIds.push(childId)
      // 递归获取子节点的子节点
      const grandChildren = getChildNodeIdsFromEdges(childId, allEdges)
      childIds.push(...grandChildren)
    }
    
    return childIds
  }, [])

  // 删除节点处理函数（带确认和子节点统计）
  const handleDeleteNode = useCallback(async (nodeId: string) => {
    // 获取节点信息用于确认对话框
    const nodeToDelete = nodes.find(node => node.id === nodeId)
    const nodeName = nodeToDelete?.data?.label || nodeId
    
    // 计算子节点数量
    let childCount = 0
    try {
      const allChildIds = getAllChildNodeIds(nodeId, nodes)
      childCount = allChildIds.length
    } catch (error) {
      // 使用边数据作为备用方案
      const allChildIds = getChildNodeIdsFromEdges(nodeId, edges)
      childCount = allChildIds.length
    }
    
    // 显示确认对话框
    setDeleteConfirm({
      visible: true,
      nodeId,
      nodeName: childCount > 0 ? `${nodeName} (包含 ${childCount} 个子节点)` : nodeName
    })
  }, [nodes, edges, getAllChildNodeIds, getChildNodeIdsFromEdges])

  // 确认删除节点
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirm || !user?.userId || !currentSession) {
      console.error('删除确认信息或用户信息缺失')
      return
    }

    setDeleteConfirm(prev => prev ? { ...prev, isDeleting: true } : null)

    const { nodeId } = deleteConfirm

    try {
      // 发送删除请求
      const response = await conversationAPI.delete(nodeId, user.userId, currentSession)
      
      if (response.code === 200) {
        console.log('节点删除成功:', response.obj)
        
        // 简化逻辑：重新加载所有节点数据
        await loadSessionNodes()
        
      } else {
        console.error('删除节点失败:', response.msg)
      }
    } catch (error) {
      console.error('删除节点时发生错误:', error)
    } finally {
      setDeleteConfirm(null)
    }
  }, [deleteConfirm, user?.userId, currentSession, loadSessionNodes])

  // 取消删除
  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm(null)
  }, [])

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

  // 全局点击事件处理，关闭右键菜单
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null)
    }

    if (contextMenu) {
      document.addEventListener('click', handleGlobalClick)
      return () => document.removeEventListener('click', handleGlobalClick)
    }

    return undefined
  }, [contextMenu])

  // 动态生成CSS字符串 - 更新版本
  const dynamicStyles = useMemo(() => `
    .react-flow__node {
      font-size: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      white-space: pre-wrap;
      word-wrap: break-word;
      text-align: left;
    }
    
    .react-flow__node:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
    
    .react-flow__node.selected {
      box-shadow: 0 0 0 2px ${isDarkMode ? '#6366f1' : '#4f46e5'};
    }
    
    .react-flow__node[data-id="session-node"] {
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      animation: pulse 2s infinite;
      text-align: center;
    }
    
    .react-flow__node-default {
      max-height: 150px;
      overflow-y: auto;
    }
    
    /* 滚动条样式 */
    .react-flow__node-default::-webkit-scrollbar {
      width: 4px;
    }
    
    .react-flow__node-default::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .react-flow__node-default::-webkit-scrollbar-thumb {
      background: ${isDarkMode ? '#6b7280' : '#d1d5db'};
      border-radius: 2px;
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

    /* Tooltip 滚动条样式 */
    .tooltip-content::-webkit-scrollbar {
      width: 6px;
    }

    .tooltip-content::-webkit-scrollbar-track {
      background: ${isDarkMode ? '#374151' : '#f3f4f6'};
      border-radius: 3px;
    }

    .tooltip-content::-webkit-scrollbar-thumb {
      background: ${isDarkMode ? '#6b7280' : '#d1d5db'};
      border-radius: 3px;
    }

    .tooltip-content::-webkit-scrollbar-thumb:hover {
      background: ${isDarkMode ? '#9ca3af' : '#9ca3af'};
    }

    /* 新增节点对话框样式 */
    .add-node-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    }

    .add-node-dialog-content {
      background: ${isDarkMode ? '#2d3748' : '#ffffff'};
      border: 1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'};
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      animation: slideIn 0.3s ease-out;
    }

    .add-node-dialog-title {
      margin: 0 0 20px 0;
      color: ${isDarkMode ? '#ffffff' : '#374151'};
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .add-node-context-info {
      margin: 0 0 20px 0;
      padding: 16px;
      background: ${isDarkMode ? '#374151' : '#f8fafc'};
      border: 1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'};
      border-radius: 8px;
      font-size: 13px;
    }

    .add-node-context-label {
      color: ${isDarkMode ? '#d1d5db' : '#6b7280'};
      margin-bottom: 8px;
      font-weight: 500;
    }

    .add-node-context-value {
      color: ${isDarkMode ? '#ffffff' : '#374151'};
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      background: ${isDarkMode ? '#1f2937' : '#ffffff'};
      padding: 8px;
      border-radius: 4px;
      border: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};
    }

    .add-node-textarea {
      width: calc(100% - 24px);
      height: 120px;
      padding: 12px;
      border: 2px solid ${isDarkMode ? '#4a5568' : '#d1d5db'};
      border-radius: 8px;
      background: ${isDarkMode ? '#374151' : '#ffffff'};
      color: ${isDarkMode ? '#ffffff' : '#374151'};
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      resize: vertical;
      outline: none;
      transition: all 0.2s ease;
      line-height: 1.5;
    }

    .add-node-textarea:focus {
      border-color: ${isDarkMode ? '#6366f1' : '#4f46e5'};
      box-shadow: 0 0 0 3px ${isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)'};
    }

    .add-node-textarea::placeholder {
      color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
    }

    .add-node-buttons {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .add-node-button {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .add-node-button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .add-node-button-cancel {
      border: 2px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};
      background: transparent;
      color: ${isDarkMode ? '#d1d5db' : '#374151'};
    }

    .add-node-button-cancel:hover:not(:disabled) {
      background: ${isDarkMode ? '#374151' : '#f9fafb'};
      border-color: ${isDarkMode ? '#9ca3af' : '#9ca3af'};
      transform: translateY(-1px);
    }

    .add-node-button-confirm {
      border: none;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .add-node-button-confirm:hover:not(:disabled) {
      background: linear-gradient(135deg, #5b5bd6 0%, #7c3aed 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    .add-node-button-confirm:disabled {
      background: #9ca3af;
      box-shadow: none;
    }

    .add-node-loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 1s ease-in-out infinite;
    }

    /* 动画效果 */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .add-node-dialog-content {
        margin: 20px;
        width: calc(100% - 40px);
        max-width: none;
      }
      
      .add-node-buttons {
        flex-direction: column;
      }
      
      .add-node-button {
        width: 100%;
      }
    }

    /* 加载节点动画样式 */
    .react-flow__node[data-loading="true"] {
      animation: nodeLoading 1.5s ease-in-out infinite;
      border-color: ${isDarkMode ? '#6366f1' : '#4f46e5'} !important;
    }

    @keyframes nodeLoading {
      0%, 100% { 
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.6);
        transform: scale(1.02);
      }
    }

    /* 流式响应光标效果 */
    .streaming-cursor {
      animation: blink 1s infinite;

    /* 文本选择区域样式 */
    .text-selection-area {
      transition: all 0.2s ease;
    }

    .text-selection-area:hover {
      border-color: ${isDarkMode ? '#6366f1' : '#4f46e5'} !important;
    }

    .text-selection-area::selection {
      background: ${isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.2)'};
    }

    .text-selection-area::-moz-selection {
      background: ${isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.2)'};
    }

    /* 选中文本高亮提示 */
    .selection-highlight {
      background: ${isDarkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'};
      border-radius: 3px;
      padding: 2px 4px;
      margin: 0 2px;
      border: 1px solid ${isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'};
    }

    .selection-info-card {
      background: ${isDarkMode ? '#0f172a' : '#f1f5f9'};
      border: 1px solid ${isDarkMode ? '#334155' : '#cbd5e1'};
      border-radius: 8px;
      padding: 12px;
      margin: 12px 0;
    }

    .selection-info-title {
      color: ${isDarkMode ? '#22c55e' : '#16a34a'};
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .selection-info-content {
      color: ${isDarkMode ? '#e2e8f0' : '#475569'};
      font-size: 12px;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      background: ${isDarkMode ? '#1e293b' : '#ffffff'};
      padding: 8px;
      border-radius: 4px;
      border: 1px solid ${isDarkMode ? '#475569' : '#e2e8f0'};
      max-height: 80px;
      overflow-y: auto;
    }

    .selection-reset-btn {
      background: ${isDarkMode ? '#ef4444' : '#dc2626'};
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .selection-reset-btn:hover {
      background: ${isDarkMode ? '#dc2626' : '#b91c1c'};
      transform: translateY(-1px);
    }

    /* 更新确认对话框样式 */
    .update-confirm-dialog {
      animation: slideInFromTop 0.3s ease-out;
    }

    @keyframes slideInFromTop {
      from {
        opacity: 0;
        transform: translateY(-30px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* 更新警告样式 */
    .update-warning-list {
      list-style-type: none;
      padding: 0;
      margin: 12px 0;
    }

    .update-warning-list li {
      padding: 4px 0;
      position: relative;
      padding-left: 20px;
    }

    .update-warning-list li:before {
      content: "⚠️";
      position: absolute;
      left: 0;
      top: 4px;
    }

    /* 更新按钮特殊效果 */
    .update-confirm-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      position: relative;
      overflow: hidden;
    }

    .update-confirm-btn:hover {
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
    }

    .update-confirm-btn:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .update-confirm-btn:hover:before {
      left: 100%;
    }

    /* 消息提示动画 */
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    /* 错误状态样式 */
    .react-flow__node[data-error="true"] {
      border-color: ${isDarkMode ? '#ef4444' : '#dc2626'} !important;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    /* 固定tooltip特殊样式 */
    .pinned-tooltip {
      animation: pinIn 0.3s ease-out;
    }

    @keyframes pinIn {
      from {
        transform: scale(0.95);
        opacity: 0.8;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
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
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeMouseMove={onNodeMouseMove}
          onNodeContextMenu={onNodeContextMenu}
          onNodeClick={onNodeClick}
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
              <div><strong>模型:</strong> {settings.modelName}</div>
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

      {/* 悬停提示 */}
      {/* 更新NodeTooltip渲染，传递鼠标状态控制函数 */}
      {hoveredNode && !pinnedTooltip && (
        <NodeTooltip
          data={hoveredNode.data}
          position={tooltipPosition}
          isDarkMode={isDarkMode}
          onClose={() => setHoveredNode(null)}
          onPin={handlePinTooltip}
          onMouseEnter={() => setIsMouseOverTooltip(true)}
          onMouseLeave={() => setIsMouseOverTooltip(false)}
        />
      )}

      {/* 固定提示 */}
      {pinnedTooltip && (
        <NodeTooltip
          data={pinnedTooltip.data}
          position={pinnedTooltip.position}
          isDarkMode={isDarkMode}
          onClose={handleCloseTooltip}
          isPinned={true}
          onPin={handlePinTooltip}
        />
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeType={contextMenu.nodeType}
          nodeId={contextMenu.nodeId}
          isDarkMode={isDarkMode}
          onClose={handleCloseContextMenu}
          onAddNode={handleAddNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={contextMenu.nodeType === 'conversation' ? handleDeleteNode : undefined}
        />
      )}

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              background: isDarkMode ? '#2d3748' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: isDarkMode ? '#ffffff' : '#374151',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              确认删除节点
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              color: isDarkMode ? '#d1d5db' : '#6b7280',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              您确定要删除节点 "{deleteConfirm.nodeName}" 吗？
              <br />
              <span style={{ color: isDarkMode ? '#f87171' : '#dc2626' }}>
                此操作不可撤销，将永久删除该节点及其所有子节点。
              </span>
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
                  borderRadius: '6px',
                  background: 'transparent',
                  color: isDarkMode ? '#d1d5db' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#374151' : '#f9fafb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#dc2626',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626'
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增节点对话框 */}
      {newNodeDialog && (
        <div
          className="add-node-dialog-overlay"
          onClick={handleCancelAddNode}
        >
          <div
            className="add-node-dialog-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="add-node-dialog-title">
              {newNodeDialog.isUpdateMode ? (
                '🔄 重新提问'
              ) : (
                newNodeDialog.nodeType === 'question' ? '📝 新建提问' : '💬 新建追问'
              )}
            </h3>
            
            {/* 追问模式：显示文本选择区域 */}
            {newNodeDialog.nodeType === 'followup' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  marginBottom: '12px', 
                  color: isDarkMode ? '#d1d5db' : '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  🎯 请选择要追问的AI回答内容：
                </div>
                
                <TextSelectionArea 
                  text={newNodeDialog.parentNodeId == "-1" ? '暂无上下文' : newNodeDialog.aiResponseText || ''}
                  onTextSelect={handleTextSelection}
                  canSelect={newNodeDialog.parentNodeId != "-1"}
                />
                {/* 显示选择信息 */}
                {textSelection && (
                  <div className="selection-info-card">
                    <div className="selection-info-title">
                      ✅ 已选择内容 
                      <button 
                        className="selection-reset-btn"
                        onClick={handleResetSelection}
                        title="重置选择"
                      >
                        重置
                      </button>
                    </div>
                    <div className="selection-info-content">
                      "{textSelection.selectedText}"
                      <br />
                      <span style={{ opacity: 0.7 }}>
                        范围: {textSelection.startIdx} - {textSelection.endIdx}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 未选择提示 */}
                {!textSelection && (
                  <div style={{
                    margin: '12px 0',
                    padding: '8px 12px',
                    background: isDarkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                    border: `1px solid ${isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                    borderRadius: '6px',
                    color: isDarkMode ? '#fbbf24' : '#d97706',
                    fontSize: '13px'
                  }}>
                    💡 请用鼠标选择上方文本中要追问的部分，未选择时将使用整个回答作为上下文
                  </div>
                )}
              </div>
            )}

            {/* 输入框 */}
            <textarea
              className="add-node-textarea"
              value={userInput}
              onChange={(e) => handleUserInputChange(e.target.value)}
              placeholder={
                newNodeDialog.isUpdateMode
                  ? '🔄 请重新输入您的问题...\n\n注意：更新后原有的回答分支将被删除'
                  : newNodeDialog.nodeType === 'question' 
                    ? '💭 请输入您的问题...\n\n例如："什么是人工智能？"' 
                    : '🔍 请输入您的追问...\n\n例如："能详细解释一下这个概念吗？"'
              }
              autoFocus
            />

            {/* 按钮组 */}
            <div className="add-node-buttons">
              <button
                className="add-node-button add-node-button-cancel"
                onClick={handleCancelAddNode}
                disabled={isCreatingNode}
              >
                ✖️ 取消
              </button>
              <button
                className="add-node-button add-node-button-confirm"
                onClick={handleConfirmAddNode}
                disabled={isCreatingNode || !userInput.trim()}
              >
                {isCreatingNode ? (
                  <>
                    <div className="add-node-loading-spinner"></div>
                    {newNodeDialog.isUpdateMode ? '更新中...' : '创建中...'}
                  </>
                ) : (
                  <>
                    {newNodeDialog.isUpdateMode ? '🔄 确认更新' : '✨ 确认创建'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 更新确认对话框 */}
      {updateConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={handleCancelUpdate}
        >
          <div
            style={{
              background: isDarkMode ? '#2d3748' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#4a5568' : '#e2e8f0'}`,
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: isDarkMode ? '#ffffff' : '#374151',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>确认重新提问</span>
            </h3>
            
            <div style={{ 
              margin: '0 0 20px 0', 
              color: isDarkMode ? '#d1d5db' : '#6b7280',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                您确定要重新提问吗？这将会：
              </p>
              <ul style={{ 
                margin: '0 0 12px 0', 
                paddingLeft: '20px',
                color: isDarkMode ? '#fbbf24' : '#d97706'
              }}>
                <li>删除当前节点的所有子节点（共 {updateConfirm.childCount} 个）</li>
                <li>重新生成AI回答</li>
                <li>所有基于原回答的后续对话将丢失</li>
              </ul>
              <p style={{ 
                margin: 0,
                color: isDarkMode ? '#f87171' : '#dc2626',
                fontWeight: '500'
              }}>
                此操作不可撤销，请谨慎选择！
              </p>
            </div>

            {/* 显示原始问题预览 */}
            <div style={{
              margin: '0 0 20px 0',
              padding: '12px',
              background: isDarkMode ? '#374151' : '#f8fafc',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                marginBottom: '6px'
              }}>
                当前问题：
              </div>
              <div style={{
                fontSize: '13px',
                color: isDarkMode ? '#ffffff' : '#374151',
                fontWeight: '500'
              }}>
                {updateConfirm.originalUserMessage || '无问题内容'}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={handleCancelUpdate}
                disabled={updateConfirm.isUpdating}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
                  borderRadius: '6px',
                  background: 'transparent',
                  color: isDarkMode ? '#d1d5db' : '#374151',
                  cursor: updateConfirm.isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  opacity: updateConfirm.isUpdating ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!updateConfirm.isUpdating) {
                    e.currentTarget.style.background = isDarkMode ? '#374151' : '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updateConfirm.isUpdating) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                ✖️ 取消
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={updateConfirm.isUpdating}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: updateConfirm.isUpdating 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  cursor: updateConfirm.isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  if (!updateConfirm.isUpdating) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!updateConfirm.isUpdating) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {updateConfirm.isUpdating ? (
                  <>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%',
                      borderTop: '2px solid #ffffff',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    处理中...
                  </>
                ) : (
                  <>
                    🔄 确认重新提问
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />

    </div>
  )
}

export default ChatArea
