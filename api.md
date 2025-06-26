# UserController API 文档

## 基础信息

- **Base URL**: `/user`
- **Content-Type**: `application/json`
- **响应格式**: JSON

## 用户管理接口

### 1. 创建用户

**接口地址**: `POST /user/create`

**请求参数**:
- **请求体** (JSON):

```json
{
  "userId": "string",
  "username": "string"
}
```

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {}
}
```

**示例请求**:
```bash
POST /user/create
Content-Type: application/json

{
  "userId": "user123",
  "username": "张三"
}
```

### 2. 获取用户

**接口地址**: `GET /user/get`

**请求参数**:
- `userId` (String, 必填): 用户ID

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {
    
  }
}
```

**示例请求**:
```bash
GET /user/get?userId=user123
```

### 3. 更新用户

**接口地址**: `PUT /user/update`

**请求参数**:
- **请求体** (JSON):

```json
{
  "userId": "string",
  "username": "string"
}
```

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {
    
  }
}
```

**示例请求**:
```bash
PUT /user/update
Content-Type: application/json

{
  "userId": "user123",
  "username": "李四"
}
```

### 4. 删除用户

**接口地址**: `DELETE /user/delete`

**请求参数**:
- `userId` (String, 必填): 用户ID

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": "用户删除成功"
}
```

**示例请求**:
```bash
DELETE /user/delete?userId=user123
```

## 会话管理接口

### 1. 创建会话

**接口地址**: `POST /user/session/create`

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {
    
  }
}
```

**示例请求**:
```bash
POST /user/session/create?userId=user123&sessionName=我的对话
```

### 2. 获取会话

**接口地址**: `GET /user/session/get`

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {
    
  }
}
```

**示例请求**:
```bash
GET /user/session/get?userId=user123&sessionName=我的对话
```

### 3. 获取所有会话名称

**接口地址**: `GET /user/session/getAllSessionsName`

**请求参数**:
- `userId` (String, 必填): 用户ID

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": [
    "会话名称1",
    "会话名称2"
  ]
}
```

**示例请求**:
```bash
GET /user/session/getAllSessionsName?userId=user123
```

### 4. 更新会话

**接口地址**: `PUT /user/session/update`

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 原会话名称
- `newSessionName` (String, 必填): 新会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {
    
  }
}
```

**示例请求**:
```bash
PUT /user/session/update?userId=user123&sessionName=我的对话&newSessionName=新对话
```

### 5. 删除会话

**接口地址**: `DELETE /user/session/delete`

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": "会话删除成功"
}
```

**示例请求**:
```bash
DELETE /user/session/delete?userId=user123&sessionName=我的对话
```

## 对话节点管理接口

### 1. 添加对话节点

**接口地址**: `POST /user/conversation/add`

**请求参数**:
- **请求体** (JSON):

```json
{
  "userId": "string",
  "sessionName": "string",
  "conversationNodeId": "string",
  "parentId": "string",
  "userMessage": "string",
  "contextStartIdx": "string",
  "contextEndIdx": "string",
  "message": "string",
  "apikey": "string",
  "baseurl": "string",
  "modelName": "string",
  "systemPrompt": "string",
  "mcpUrls": ["string"]
}
```

**响应格式**: 流式响应 (`text/plain; charset=utf-8`)
- 返回AI回答的流式数据，每个数据块为字符串

**示例请求**:
```bash
POST /user/conversation/add
Content-Type: application/json

{
  "userId": "user123",
  "sessionName": "我的对话",
  "conversationNodeId": "node_123",
  "parentId": "node_001",
  "userMessage": "你好，请介绍一下人工智能",
  "contextStartIdx": "0",
  "contextEndIdx": "10",
  "message": "你好，请介绍一下人工智能",
  "apikey": "your-api-key",
  "baseurl": "https://api.openai.com/v1",
  "modelName": "gpt-3.5-turbo",
  "systemPrompt": "你是一个有用的AI助手",
  "mcpUrls": ["https://example.com/mcp1", "https://example.com/mcp2"]
}
```

### 2. 更新对话节点

**接口地址**: `PUT /user/conversation/update`

**请求参数**:
- **请求体** (JSON):

```json
{
  "userId": "string",
  "sessionName": "string",
  "conversationNodeId": "string",
  "parentId": "string",
  "userMessage": "string",
  "contextStartIdx": "string",
  "contextEndIdx": "string",
  "message": "string",
  "apikey": "string",
  "baseurl": "string",
  "modelName": "string",
  "systemPrompt": "string",
  "mcpUrls": ["string"]
}
```

**响应格式**: 流式响应 (`text/plain; charset=utf-8`)
- 返回AI重新生成回答的流式数据，每个数据块为字符串

**示例请求**:
```bash
PUT /user/conversation/update
Content-Type: application/json

{
  "userId": "user123",
  "sessionName": "我的对话",
  "conversationNodeId": "node_123",
  "parentId": "node_001",
  "userMessage": "请详细介绍一下机器学习",
  "contextStartIdx": "0",
  "contextEndIdx": "15",
  "message": "请详细介绍一下机器学习",
  "apikey": "your-api-key",
  "baseurl": "https://api.openai.com/v1",
  "modelName": "gpt-4",
  "systemPrompt": "你是一个专业的AI技术专家",
  "mcpUrls": ["https://example.com/mcp1"]
}
```

### 3. 删除对话节点

**接口地址**: `DELETE /user/conversation/delete/{conversationNodeId}`

**路径参数**:
- `conversationNodeId` (String, 必填): 对话节点ID

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": "对话节点删除成功"
}
```

**示例请求**:
```bash
DELETE /user/conversation/delete/node_123?userId=user123&sessionName=我的对话
```

### 4. 获取对话节点

**接口地址**: `GET /user/conversation/get/{conversationNodeId}`

**路径参数**:
- `conversationNodeId` (String, 必填): 对话节点ID

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": {
    
  }
}
```

**示例请求**:
```bash
GET /user/conversation/get/node_123?userId=user123&sessionName=我的对话
```

### 5. 获取所有对话节点ID

**接口地址**: `GET /user/conversation/getAllConversationNodesId`

**请求参数**:
- `userId` (String, 必填): 用户ID
- `sessionName` (String, 必填): 会话名称

**响应格式**:
```json
{
  "code": 200,
  "msg": "success",
  "obj": [
    "node_001",
    "node_002"
  ]
}
```

**示例请求**:
```bash
GET /user/conversation/getAllConversationNodesId?userId=user123&sessionName=我的对话
```

## 数据模型

### UserVO

```json
{
  "userId": "string",
  "username": "string"
}
```

### ConversationRequestVO

```json
{
  "userId": "string",
  "sessionName": "string",
  "conversationNodeId": "string",
  "parentId": "string",
  "userMessage": "string",
  "contextStartIdx": "string",
  "contextEndIdx": "string",
  "message": "string",
  "apikey": "string",
  "baseurl": "string",
  "modelName": "string",
  "systemPrompt": "string",
  "mcpUrls": ["string"]
}
```

### Result

```json
{
  "code": 200,
  "msg": "success",
  "obj": {}
}
```

## 错误处理

### 错误响应格式

```json
{
  "code": 500,
  "msg": "错误信息",
  "obj": null
}
```

### 常见错误码

- `200`: 成功
- `500`: 服务器内部错误
- 其他错误码根据具体业务逻辑返回

## 注意事项

1. **流式响应**: `addConversationNode` 和 `updateConversationNode` 接口返回流式数据，前端需要使用 Server-Sent Events 或类似技术接收
2. **参数验证**: 所有必填参数都需要提供，否则可能返回错误
3. **会话管理**: 在操作对话节点前，需要确保对应的会话已存在
4. **编码格式**: 所有请求和响应都使用 UTF-8 编码
5. **用户管理**: 在创建会话前，需要确保用户已存在
6. **请求体格式**: 用户管理的创建和更新接口现在使用JSON请求体而不是查询参数
        