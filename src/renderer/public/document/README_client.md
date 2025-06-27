# TreeLearn Client v2

一个基于 Electron + React + TypeScript 构建的智能学习对话客户端，支持树状对话结构和流式AI交互。

## 🚀 功能特性

- **智能对话**: 支持与AI进行实时对话交互，流式响应显示
- **树状结构**: 以树状节点形式组织和管理对话内容，支持分支对话
- **会话管理**: 创建、编辑、删除和切换多个对话会话
- **流式响应**: 实时显示AI回复内容，提供流畅的交互体验
- **主题切换**: 支持浅色/深色主题，可跟随系统设置
- **用户系统**: 用户注册、登录和身份验证
- **设置配置**: 自定义API配置、模型参数、系统提示词等
- **Markdown渲染**: 支持富文本内容显示，包括数学公式渲染
- **节点可视化**: 使用ReactFlow实现交互式节点图表
- **右键菜单**: 支持节点的添加、删除、更新等操作
- **工具提示**: 悬停显示节点详细信息

## 🛠️ 技术栈

### 核心框架
- **前端框架**: React 19.1.0 + TypeScript 5.8.3
- **桌面应用**: Electron 35.1.5
- **构建工具**: Electron Vite 3.1.0

### UI与交互
- **节点图表**: ReactFlow 11.11.4
- **Markdown渲染**: react-markdown 10.1.0
- **数学公式**: rehype-katex 7.0.1
- **Markdown扩展**: remark-gfm 4.0.1, remark-math 6.0.0
- **安全处理**: DOMPurify 3.2.6

### 开发工具
- **代码规范**: ESLint 9.24.0 + Prettier 3.5.3
- **类型检查**: TypeScript
- **打包工具**: Electron Builder 25.1.8

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Windows 10/11, macOS 10.15+, 或 Linux

## 🏗️ 项目结构

```
src/
├── main/                    # 主进程代码
│   └── index.ts            # Electron主进程入口
├── preload/                # 预加载脚本
│   ├── index.ts           # 预加载脚本
│   └── index.d.ts         # 类型定义
└── renderer/               # 渲染进程代码
    ├── index.html         # HTML模板
    └── src/
        ├── App.tsx        # 应用根组件
        ├── main.tsx       # 渲染进程入口
        ├── components/    # React组件
        │   ├── Chat/     # 聊天相关组件
        │   │   ├── ChatArea.tsx        # 主聊天区域
        │   │   ├── ChatHeader.tsx      # 聊天头部
        │   │   ├── ChatInput.tsx       # 消息输入
        │   │   ├── StreamingMarkdown.tsx # 流式Markdown渲染
        │   │   ├── NodeTreeView.tsx    # 节点树视图
        │   │   ├── NodeContextMenu.tsx # 节点右键菜单
        │   │   └── Tooltip/           # 工具提示组件
        │   ├── ChatHistory/  # 会话历史组件
        │   ├── Pages/        # 页面组件
        │   │   ├── LoginPage.tsx      # 登录页面
        │   │   ├── RegisterPage.tsx   # 注册页面
        │   │   ├── SettingsPage.tsx   # 设置页面
        │   │   ├── AuthorPage.tsx     # 作者信息
        │   │   ├── VersionPage.tsx    # 版本信息
        │   │   └── GitHubPage.tsx     # GitHub页面
        │   ├── Sidebar/      # 侧边栏组件
        │   ├── Menu/         # 菜单组件
        │   └── Providers/    # 上下文提供者
        ├── hooks/         # 自定义Hooks
        │   ├── useAuth.ts            # 认证Hook
        │   └── useChat.ts            # 聊天Hook
        ├── api/           # API接口
        │   └── API.ts               # API客户端
        ├── contexts/      # React上下文
        │   └── ThemeContext.tsx     # 主题上下文
        ├── share/         # 共享工具和配置
        │   └── share.ts             # 共享工具函数
        ├── types/         # TypeScript类型定义
        │   └── index.ts             # 类型定义
        └── assets/        # 静态资源
            ├── ChatPage.css         # 主样式文件
            └── reactflow-theme.css  # ReactFlow主题
```

## 🔑 主要组件

### 核心组件
- **ChatArea**: 主聊天区域，处理消息显示和流式响应，集成ReactFlow节点图表
- **StreamingMarkdown**: 流式Markdown渲染组件，支持实时内容更新
- **NodeTreeView**: 树状节点视图，管理对话结构和节点关系
- **ChatInput**: 消息输入组件，支持多行输入和快捷键

### 会话管理
- **ChatHistory**: 会话历史列表，支持会话切换和管理
- **ChatHistoryItem**: 单个会话项，支持重命名、删除等操作
- **SessionManager**: 会话管理逻辑，处理会话的CRUD操作

### 用户界面
- **SettingsPage**: 设置页面，配置API、主题、系统提示词等
- **LoginPage/RegisterPage**: 用户认证页面
- **Sidebar**: 侧边栏，包含会话列表和用户信息
- **Menu**: 应用菜单，提供各种功能入口

### 工具组件
- **NodeTooltip**: 节点工具提示，显示详细信息
- **NodeContextMenu**: 节点右键菜单，提供操作选项
- **MessageTools**: 消息工具栏，提供复制、编辑等功能

## ⚙️ 配置说明

应用支持以下配置项：

### API配置
- **API Key**: OpenAI或其他兼容API的密钥
- **Base URL**: API服务器地址（默认：https://api.openai.com/v1）
- **模型名称**: 使用的AI模型（默认：gpt-3.5-turbo）
- **系统提示词**: 自定义AI行为和角色设定

### 界面设置
- **主题设置**: 浅色/深色/跟随系统
- **消息历史**: 保留天数设置
- **自动保存**: 是否自动保存对话内容

### 高级配置
- **MCP URLs**: 多模态内容处理URL配置
- **快捷键**: 自定义键盘快捷键

## 🎯 使用指南

### 基本操作
1. **创建会话**: 点击侧边栏的"New Session"按钮
2. **发送消息**: 在输入框中输入内容，按Ctrl+Enter发送
3. **查看节点**: 在聊天区域查看树状对话结构
4. **节点操作**: 右键点击节点进行添加、删除、更新等操作

### 高级功能
- **分支对话**: 从任意节点创建新的对话分支
- **节点导航**: 点击节点查看详细信息和上下文
- **会话管理**: 重命名、删除、切换不同会话
- **设置配置**: 在设置页面自定义API和界面选项

## 🔧 开发指南

### 添加新组件
1. 在`src/renderer/src/components/`下创建组件文件
2. 遵循TypeScript类型定义
3. 使用统一的样式规范

### API集成
- 所有API调用通过`src/renderer/src/api/API.ts`进行
- 支持会话管理、对话节点、用户认证等接口

### 主题开发
- 主题配置在`src/renderer/src/share/share.ts`中定义
- CSS变量支持动态主题切换
- 支持系统主题自动检测

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的AI对话功能
- 实现树状节点结构
- 添加用户认证系统
- 支持主题切换
- 集成流式响应

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request