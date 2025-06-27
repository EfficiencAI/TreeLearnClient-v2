// API接口类型定义
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  obj: T
}

export interface LoginResult{
  userName: string
}

// 用户相关接口参数类型
export interface CreateUserParams {
  userId: string
  username: string
  [key: string]: unknown // 添加索引签名
}

export interface UpdateUserParams {
  userId: string
  username: string
  [key: string]: unknown // 添加索引签名
}

// 会话相关接口参数类型
export interface CreateSessionParams {
  userId: string
  sessionName: string
}

export interface UpdateSessionParams {
  userId: string
  sessionName: string
  newSessionName: string
}

// 对话节点相关接口参数类型
export interface ConversationRequestParams {
  userId: string
  sessionName: string
  conversationNodeId: string
  registrationCertificate: string
  parentId: string
  userMessage: string
  contextStartIdx: string
  contextEndIdx: string
  message: string
  apikey: string
  baseurl: string
  modelName: string
  systemPrompt: string
  mcpUrls: string[]
  [key: string]: unknown // 添加索引签名
}
// 对话节点数据接口
export interface ConversationNodeData {
  UserMessage?: string
  AIMessage?: string
  LinkedConversationNodesID?: string[]
  conversationNodeId?: string
  parentId?: string
  // 其他可能的属性
}
// 对话节点注册结果接口
export interface ConversationNodeRegistrationResult {
  conversationNodeId?: string
  registrationCertificate: string
}
// 会话数据接口  
export interface SessionData {
  LinkedConversationNodesID?: string[]
  sessionId?: string
  sessionName?: string
  userId?: string
  // 其他可能的属性
}

// API基础配置
const API_BASE_URL = 'http://localhost:8080' // 根据实际情况修改

// 通用请求方法
class ApiClient {
  private readonly baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // GET请求
  private async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${this.baseURL}${url}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  // POST请求
  private async post<T>(url: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // POST请求（带查询参数）
  private async postWithParams<T>(
    url: string,
    data: Record<string, unknown>,
    params: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const queryString = '?' + new URLSearchParams(params).toString()
    const response = await fetch(`${this.baseURL}${url}${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // PUT请求
  private async put<T>(url: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // PUT请求（带查询参数）
  private async putWithParams<T>(
    url: string,
    data: Record<string, unknown>,
    params: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const queryString = '?' + new URLSearchParams(params).toString()
    const response = await fetch(`${this.baseURL}${url}${queryString}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.json()
  }

  // DELETE请求
  private async delete<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${this.baseURL}${url}${queryString}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  // 流式请求（用于对话接口）
  private async postStream(
    url: string,
    data: Record<string, unknown>
  ): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.body
  }

  // 流式PUT请求
  private async putStream(
    url: string,
    data: Record<string, unknown>
  ): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    return response.body
  }

  // ==================== 用户管理接口 ====================

  // 创建用户
  async createUser(params: CreateUserParams): Promise<ApiResponse> {
    return this.post('/user/create', params)
  }

  // 获取用户
  async getUser(userId: string): Promise<ApiResponse<LoginResult>> {
    return this.get('/user/get', { userId })
  }

  // 更新用户
  async updateUser(params: UpdateUserParams): Promise<ApiResponse> {
    return this.put('/user/update', params)
  }

  // 删除用户
  async deleteUser(userId: string): Promise<ApiResponse<string>> {
    return this.delete('/user/delete', { userId })
  }

  // ==================== 会话管理接口 ====================

  // 创建会话
  async createSession(params: CreateSessionParams): Promise<ApiResponse> {
    return this.postWithParams(
      '/user/session/create',
      {},
      {
        userId: params.userId,
        sessionName: params.sessionName
      }
    )
  }

  // 获取会话
  async getSession(userId: string, sessionName: string): Promise<ApiResponse<SessionData>> {
    return this.get('/user/session/get', { userId, sessionName })
  }

  // 获取所有会话名称
  async getAllSessionsName(userId: string): Promise<ApiResponse<string[]>> {
    return this.get('/user/session/getAllSessionsName', { userId })
  }

  // 更新会话
  async updateSession(params: UpdateSessionParams): Promise<ApiResponse> {
    return this.putWithParams(
      '/user/session/update',
      {},
      {
        userId: params.userId,
        sessionName: params.sessionName,
        newSessionName: params.newSessionName
      }
    )
  }

  // 删除会话
  async deleteSession(userId: string, sessionName: string): Promise<ApiResponse<string>> {
    return this.delete('/user/session/delete', { userId, sessionName })
  }

  // ==================== 对话节点管理接口 ====================

  async registerForNewConversationNode(
    userId: string, 
    sessionName: string, 
    parentId: string
  ): Promise<ApiResponse<ConversationNodeRegistrationResult>> {
    return this.get('/user/conversation/registerForNewConversationNode', {
      userId,
      sessionName,
      parentId
    })
  }

  // 添加对话节点（流式响应）
  async addConversationNode(
    params: ConversationRequestParams
  ): Promise<ReadableStream<Uint8Array> | null> {
    return this.postStream('/user/conversation/add', params)
  }

  // 更新对话节点（流式响应）
  async updateConversationNode(
    params: ConversationRequestParams
  ): Promise<ReadableStream<Uint8Array> | null> {
    return this.putStream('/user/conversation/update', params)
  }

  // 删除对话节点
  async deleteConversationNode(
    conversationNodeId: string,
    userId: string,
    sessionName: string
  ): Promise<ApiResponse<string>> {
    return this.delete(`/user/conversation/delete/${conversationNodeId}`, { userId, sessionName })
  }

  // 获取对话节点
  async getConversationNode(
    conversationNodeId: string,
    userId: string,
    sessionName: string
  ): Promise<ApiResponse<ConversationNodeData>> {
    return this.get(`/user/conversation/get/${conversationNodeId}`, { userId, sessionName })
  }

  // 获取所有对话节点ID
  async getAllConversationNodesId(
    userId: string,
    sessionName: string
  ): Promise<ApiResponse<string[]>> {
    return this.get('/user/conversation/getAllConversationNodesId', { userId, sessionName })
  }
}

// 创建API实例
export const apiClient = new ApiClient()

// 导出便捷方法
export const userAPI = {
  create: (params: CreateUserParams) => apiClient.createUser(params),
  get: (userId: string) => apiClient.getUser(userId),
  update: (params: UpdateUserParams) => apiClient.updateUser(params),
  delete: (userId: string) => apiClient.deleteUser(userId)
}

export const sessionAPI = {
  create: (params: CreateSessionParams) => apiClient.createSession(params),
  get: (userId: string, sessionName: string): Promise<ApiResponse<SessionData>> => 
    apiClient.getSession(userId, sessionName),
  getAllNames: (userId: string) => apiClient.getAllSessionsName(userId),
  update: (params: UpdateSessionParams) => apiClient.updateSession(params),
  delete: (userId: string, sessionName: string) => apiClient.deleteSession(userId, sessionName)
}

export const conversationAPI = {
  register: (userId: string, sessionName: string, parentId: string): Promise<ApiResponse<ConversationNodeRegistrationResult>> => apiClient.registerForNewConversationNode(userId, sessionName, parentId),
  add: (params: ConversationRequestParams) => apiClient.addConversationNode(params),
  update: (params: ConversationRequestParams) => apiClient.updateConversationNode(params),
  delete: (conversationNodeId: string, userId: string, sessionName: string) =>
    apiClient.deleteConversationNode(conversationNodeId, userId, sessionName),
  get: (conversationNodeId: string, userId: string, sessionName: string): Promise<ApiResponse<ConversationNodeData>> =>
    apiClient.getConversationNode(conversationNodeId, userId, sessionName),
  getAllIds: (userId: string, sessionName: string) =>
    apiClient.getAllConversationNodesId(userId, sessionName)
}

// 流式数据处理工具函数
export const streamUtils = {
  // 处理流式响应
  async processStream(
    stream: ReadableStream<Uint8Array> | null,
    onChunk: (chunk: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!stream) {
      onError?.(new Error('Stream is null'))
      return
    }

    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          onComplete?.()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        onChunk(chunk)
      }
    } catch (error) {
      onError?.(error as Error)
    } finally {
      reader.releaseLock()
    }
  },

  // 将流式响应转换为完整字符串
  async streamToString(stream: ReadableStream<Uint8Array> | null): Promise<string> {
    if (!stream) return ''

    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let result = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        result += decoder.decode(value, { stream: true })
      }
    } finally {
      reader.releaseLock()
    }

    return result
  }
}

export default apiClient
