import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { conversationAPI } from '../../api/API'
import type { ConversationRequestParams } from '../../api/API'

interface NodeTreeViewProps {
  sessionName: string
  onClose: () => void
  onNodeSelect?: (parentId: string) => void // 新增：节点选择回调
}

interface TreeNode {
  id: string
  level: number
  children: TreeNode[]
}

interface ContextMenu {
  visible: boolean
  x: number
  y: number
  nodeId: string
}

interface NodeDialog {
  visible: boolean
  type: 'update' | 'query'
  nodeId: string
  parentId: string
  message: string
}

const NodeTreeView: React.FC<NodeTreeViewProps> = ({ sessionName, onClose, onNodeSelect }) => {
  const [nodes, setNodes] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('') // 新增：选中的节点ID
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    nodeId: ''
  })
  const [dialog, setDialog] = useState<NodeDialog>({
    visible: false,
    type: 'update',
    nodeId: '',
    parentId: '',
    message: ''
  })
  const { user } = useAuth()

  // 构建树结构
  const buildTree = (nodeIds: string[]): TreeNode[] => {
    const nodeMap = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    // 创建所有节点
    nodeIds.forEach((id) => {
      nodeMap.set(id, {
        id,
        level: id.length,
        children: []
      })
    })

    // 构建父子关系
    nodeIds.forEach((id) => {
      const node = nodeMap.get(id)!
      if (id.length === 1) {
        // 根节点
        roots.push(node)
      } else {
        // 找到父节点
        const parentId = id.slice(0, -1)
        const parent = nodeMap.get(parentId)
        if (parent) {
          parent.children.push(node)
        }
      }
    })

    return roots
  }

  // 获取所有节点
  const fetchNodes = async (): Promise<void> => {
    if (!user?.userId) return

    setLoading(true)
    try {
      const response = await conversationAPI.getAllIds(user.userId, sessionName)
      if (response.code === 200 && response.obj) {
        const tree = buildTree(response.obj)
        setNodes(tree)
      }
    } catch (error) {
      console.error('获取节点失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNodes()
  }, [sessionName, user?.userId])

  // 关闭右键菜单
  useEffect(() => {
    const handleClick = (): void => setContextMenu((prev) => ({ ...prev, visible: false }))
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, nodeId: string): void => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeId
    })
  }

  // 处理左键点击节点 - 简化版本，只记录父节点ID
  const handleNodeClick = (nodeId: string): void => {
    setSelectedNodeId(nodeId)
    // 如果有回调函数，通知父组件选中的节点ID
    if (onNodeSelect) {
      onNodeSelect(nodeId)
    }
    // 可以在这里添加视觉反馈，比如高亮选中的节点
    console.log('选中节点作为父节点:', nodeId)
  }

  // 处理菜单项点击
  const handleMenuClick = (action: 'add' | 'delete' | 'update' | 'query'): void => {
    const nodeId = contextMenu.nodeId
    setContextMenu((prev) => ({ ...prev, visible: false }))

    switch (action) {
      case 'add':
        // 右键添加节点也只记录父节点ID
        setSelectedNodeId(nodeId)
        if (onNodeSelect) {
          onNodeSelect(nodeId)
        }
        console.log('选中节点作为父节点:', nodeId)
        break
      case 'update':
        setDialog({
          visible: true,
          type: 'update',
          nodeId: nodeId,
          parentId: nodeId.length === 1 ? '-1' : nodeId.slice(0, -1),
          message: ''
        })
        break
      case 'query':
        setDialog({
          visible: true,
          type: 'query',
          nodeId: nodeId,
          parentId: '',
          message: ''
        })
        break
      case 'delete':
        handleDeleteNode(nodeId)
        break
    }
  }

  // 删除节点
  const handleDeleteNode = async (nodeId: string): Promise<void> => {
    if (!user?.userId) return

    if (confirm(`确定要删除节点 ${nodeId} 吗？`)) {
      try {
        const response = await conversationAPI.delete(nodeId, user.userId, sessionName)
        if (response.code === 200) {
          await fetchNodes() // 重新获取节点
          alert('删除成功')
        } else {
          alert('删除失败: ')
        }
      } catch (error) {
        console.error('删除节点失败:', error)
        alert('删除失败')
      }
    }
  }

  // 查询节点
  const handleQueryNode = async (nodeId: string): Promise<void> => {
    if (!user?.userId) return

    try {
      const response = await conversationAPI.get(nodeId, user.userId, sessionName)
      if (response.code === 200) {
        alert(`节点信息:\n${JSON.stringify(response.obj, null, 2)}`)
      } else {
        alert('查询失败: ')
      }
    } catch (error) {
      console.error('查询节点失败:', error)
      alert('查询失败')
    }
  }

  // 发送请求（仅用于更新节点）
  const handleSendRequest = async (): Promise<void> => {
    if (!user?.userId || !dialog.message.trim()) {
      alert('请输入消息内容')
      return
    }

    try {
      const params: ConversationRequestParams = {
        userId: user.userId,
        sessionName: sessionName,
        conversationNodeId: dialog.nodeId,
        parentId: dialog.parentId,
        userMessage: dialog.message,
        contextStartIdx: '',
        contextEndIdx: '',
        message: dialog.message,
        apikey: '',
        baseurl: '',
        modelName: '',
        systemPrompt: '',
        mcpUrls: []
      }

      if (dialog.type === 'update') {
        const response = await conversationAPI.update(params)
        if (response) {
          // 处理流式响应
          const reader = response.getReader()
          let result = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            result += chunk
          }

          console.log('更新响应结果:', result)
          await fetchNodes() // 重新获取节点
          alert('更新成功')
        }
      }
    } catch (error) {
      console.error('更新失败:', error)
      alert('更新失败')
    }

    setDialog((prev) => ({ ...prev, visible: false, message: '' }))
  }

  // 渲染树节点
  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedNodeId === node.id

    return (
      <div key={node.id} className="tree-node" style={{ marginLeft: depth * 20 }}>
        <div
          className={`node-content ${isSelected ? 'selected' : ''}`}
          onClick={() => handleNodeClick(node.id)}
          onContextMenu={(e) => handleContextMenu(e, node.id)}
        >
          <span className="node-id">{node.id}</span>
          <span className="node-level">Level {node.level}</span>
          {isSelected && <span className="selected-indicator">（已选为父节点）</span>}
        </div>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="node-tree-overlay">
      <div className="node-tree-modal">
        <div className="modal-header">
          <h3>会话节点树 - {sessionName}</h3>
          <div className="header-info">
            {selectedNodeId && (
              <span className="selected-info">当前选中父节点: {selectedNodeId}</span>
            )}
          </div>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>
        <div className="modal-content">
          <div className="usage-tip">💡 左键点击节点选择为父节点，右键显示更多操作</div>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <div className="tree-container">
              {nodes.length === 0 ? (
                <div className="empty-tree">暂无节点</div>
              ) : (
                nodes.map((node) => renderNode(node))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <div className="menu-item" onClick={() => handleMenuClick('add')}>
            选择为父节点
          </div>
          <div className="menu-item" onClick={() => handleMenuClick('delete')}>
            删除节点
          </div>
          <div className="menu-item" onClick={() => handleMenuClick('update')}>
            更新节点
          </div>
          <div className="menu-item" onClick={() => handleMenuClick('query')}>
            查询节点
          </div>
        </div>
      )}

      {/* 对话框（仅用于更新和查询） */}
      {dialog.visible && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h4>
                {dialog.type === 'update' && '更新节点'}
                {dialog.type === 'query' && '查询节点'}
              </h4>
              <button
                className="close-btn"
                onClick={() => setDialog((prev) => ({ ...prev, visible: false }))}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="form-group">
                <label>节点ID:</label>
                <input type="text" value={dialog.nodeId} readOnly className="form-input" />
              </div>
              {dialog.type === 'update' && (
                <div className="form-group">
                  <label>消息内容:</label>
                  <textarea
                    value={dialog.message}
                    onChange={(e) => setDialog((prev) => ({ ...prev, message: e.target.value }))}
                    className="form-textarea"
                    placeholder="请输入更新的消息内容"
                    rows={4}
                  />
                </div>
              )}
            </div>
            <div className="dialog-footer">
              <button
                className="btn btn-cancel"
                onClick={() => setDialog((prev) => ({ ...prev, visible: false }))}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={
                  dialog.type === 'query' ? () => handleQueryNode(dialog.nodeId) : handleSendRequest
                }
              >
                {dialog.type === 'query' ? '查询' : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NodeTreeView
