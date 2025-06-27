# TreeLearn
一个基于 Spring Boot 和 LangChain4j 的智能聊天应用，支持多种AI模型和MCP协议集成。

## 项目简介
TreeLearn 是一个现代化的 AI 聊天应用，使用 Spring Boot 3.4.6 框架构建，集成了 LangChain4j 来与多种AI模型进行交互。项目支持流式响应、对话节点管理、会话管理和用户管理，提供了完整的对话树结构存储和CORS跨域配置。

## 技术栈
- **后端框架**: Spring Boot 3.4.6
- **AI 集成**: LangChain4j 1.1.0
- **MCP 协议**: Model Context Protocol 支持
- **大语言模型**: 支持 OpenAI 兼容接口 (默认 qwen3:14b)
- **响应式编程**: Project Reactor
- **构建工具**: Maven
- **Java 版本**: 17
- **其他依赖**:
    - Lombok 1.18.36 (简化代码)
    - Spring Boot Starter Web (Web 服务)
    - Spring Boot Starter Test (测试)
    - SLF4J + Logback (日志)

## 项目结构

```
src/
├── main/
│   ├── java/
│   │   └── io/github/EfficiencAI/
│   │       ├── AIChatApplication.java          # 主启动类
│   │       ├── Assert/
│   │       │   └── Assert.java                 # 断言工具类
│   │       ├── DAO/
│   │       │   └── ConversationDAO.java        # 对话数据访问层
│   │       ├── config/
│   │       │   └── CorsConfig.java             # CORS 跨域配置
│   │       ├── controller/
│   │       │   ├── ClientController.java       # AI聊天控制器
│   │       │   └── UserController.java         # 用户管理控制器
│   │       ├── pojo/
│   │       │   ├── DTO/                        # 数据传输对象
│   │       │   │   ├── ChatRequestDTO.java
│   │       │   │   ├── NodeRequestDTO.java
│   │       │   │   └── UserDTO.java
│   │       │   ├── Entites/                    # 实体类
│   │       │   │   └── node/
│   │       │   │       ├── Base/               # 基础节点类
│   │       │   │       ├── ConversationNode.java  # 对话节点
│   │       │   │       ├── SessionNode.java    # 会话节点
│   │       │   │       └── UserNode.java       # 用户节点
│   │       │   └── VO/                         # 视图对象
│   │       │       ├── ChatRequestVO.java
│   │       │       ├── ConversationRequestVO.java
│   │       │       ├── Result.java             # 统一响应结果
│   │       │       └── ...
│   │       ├── service/
│   │       │   ├── AiService.java              # AI 服务接口
│   │       │   ├── UserService.java            # 用户服务接口
│   │       │   └── impl/
│   │       │       ├── AiServiceImpl.java      # AI 服务实现
│   │       │       └── UserServiceImpl.java    # 用户服务实现
│   │       └── utils/
│   │           ├── Cache/
│   │           │   └── ConversationDAOCache.java # 对话缓存
│   │           ├── ClientUtil.java             # 客户端工具
│   │           ├── FileOperationUtil.java      # 文件操作工具
│   │           └── IDElementComposition.java   # ID组合工具
│   └── resources/
│       ├── application.yml                     # 应用配置文件
│       └── aiConfig.yml                        # AI配置文件
└── test/
└── java/
└── io/github/EfficiencAI/
└── AiChatApplicationTests.java     # 测试类
```

## 功能特性

- 🤖 **AI 聊天**: 集成 LangChain4j，支持多种AI模型
- 🔄 **流式响应**: 支持实时流式输出，提升用户体验
- 🌳 **对话树结构**: 支持分支对话和上下文管理
- 👥 **用户管理**: 完整的用户注册、登录、管理功能
- 💬 **会话管理**: 支持多会话管理和会话持久化
- 📝 **对话节点**: 支持对话节点的增删改查操作
- 🔗 **MCP 协议**: 支持 Model Context Protocol 集成
- 🌐 **CORS 支持**: 配置了跨域资源共享，支持前端调用
- 📊 **统一响应**: 标准化的 API 响应格式
- 🏗️ **模块化设计**: 清晰地分层架构，易于维护和扩展
- 💾 **文件存储**: 基于文件系统的数据持久化

## 环境要求

- Java 17+
- Maven 3.6+
- 兼容 OpenAI API 的模型服务 (如 Ollama、OpenAI等)

## 快速开始

### 1. 安装 AI 模型服务

#### 使用 Ollama (推荐)
```bash
# 安装 Ollama
# 访问 https://ollama.ai 下载安装

# 拉取 qwen3:14b 模型
ollama pull qwen3:14b

# 启动 Ollama 服务 (默认端口 11434)
ollama serve
```

#### 或使用其他 OpenAI 兼容服务
确保你的AI服务提供OpenAI兼容的API接口。

### 2. 克隆并运行项目

```bash
# 克隆项目
git clone https://github.com/your-username/AIChat.git
cd AIChat

# 编译项目
mvnw clean compile

# 运行项目
mvnw spring-boot:run
```

### 3. 配置AI服务

修改 `src/main/resources/aiConfig.yml`：

```yaml
ai:
  baseurl: http://127.0.0.1:11434  # AI服务地址
  apikey:                          # API密钥(如需要)
  modelName: qwen3:14b             # 模型名称
```

### 4. 测试 API

项目启动后，可以通过以下方式测试功能：

```bash
# 发送聊天请求
curl -X POST "http://localhost:8080/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "apikey": "",
    "baseurl": "http://127.0.0.1:11434",
    "modelName": "qwen3:14b"
  }'
```

## API 接口

### AI 聊天接口

- **URL**: `/ai/chat`
- **方法**: POST
- **请求体**: ChatRequestVO
- **响应**: 流式文本响应

### 用户管理接口

- **创建用户**: `POST /user/create`
- **获取用户**: `GET /user/get?userId={userId}`
- **更新用户**: `PUT /user/update`
- **删除用户**: `DELETE /user/delete?userId={userId}`

### 会话管理接口

- **创建会话**: `POST /user/session/create`
- **获取会话**: `GET /user/session/get`
- **获取所有会话名**: `GET /user/session/getAllSessionsName`
- **更新会话**: `PUT /user/session/update`
- **删除会话**: `DELETE /user/session/delete`

### 对话节点管理接口

- **注册新对话节点**: `GET /user/conversation/registerForNewConversationNode`
- **添加对话节点**: `POST /user/conversation/add`
- **更新对话节点**: `PUT /user/conversation/update`
- **删除对话节点**: `DELETE /user/conversation/delete/{conversationNodeId}`
- **获取对话节点**: `GET /user/conversation/get/{conversationNodeId}`
- **获取所有对话节点ID**: `GET /user/conversation/getAllConversationNodesId`

## 配置说明

### application.yml 配置

```yaml
spring:
  application:
    name: AIChat
  ai:
    openai:
      base-url: http://127.0.0.1:11434  # AI服务地址
      api-key: InvalidPlaceholder       # API密钥占位符
```

### aiConfig.yml 配置

```yaml
ai:
  baseurl: http://127.0.0.1:11434  # AI服务基础URL
  apikey:                          # API密钥
  modelName: qwen3:14b             # 默认模型名称
```

## 数据存储

项目使用文件系统进行数据持久化：
- 用户数据存储在 `./Saves/Users/` 目录
- 会话数据存储在 `./Saves/Sessions/` 目录
- 支持对话树结构和分支对话

## 开发说明

- 项目使用 UTF-8 编码
- 换行符统一使用 LF
- 代码缩进规则参考 `.editorconfig` 文件
- 使用 Lombok 简化代码，需要 IDE 安装 Lombok 插件
- 支持响应式编程模式
- 集成 MCP (Model Context Protocol) 协议
        