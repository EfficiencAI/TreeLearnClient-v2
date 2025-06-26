# TreeLearn Client v2

一个基于 Electron + React + TypeScript 构建的智能学习对话客户端，支持树状对话结构和流式AI交互。

## 🚀 功能特性

- **智能对话**: 支持与AI进行实时对话交互
- **树状结构**: 以树状节点形式组织和管理对话内容
- **会话管理**: 创建、编辑、删除和切换多个对话会话
- **流式响应**: 实时显示AI回复内容，提供流畅的交互体验
- **主题切换**: 支持浅色/深色主题，可跟随系统设置
- **用户系统**: 用户注册、登录和身份验证
- **设置配置**: 自定义API配置、模型参数等
- **Markdown渲染**: 支持富文本内容显示，包括数学公式渲染

## 🛠️ 技术栈

- **前端框架**: React 19.1.0 + TypeScript
- **桌面应用**: Electron 35.1.5
- **构建工具**: Electron Vite 3.1.0
- **UI组件**: 自定义组件库
- **Markdown**: react-markdown + remark-gfm + rehype-katex
- **代码规范**: ESLint + Prettier

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 🔧 开发环境设置

### 推荐IDE配置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 代码检查和格式化

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run typecheck
```

## 📦 构建和打包

### 开发构建

```bash
npm run build
```

### 生产环境打包

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# 仅构建不打包
npm run build:unpack
```

## 🏗️ 项目结构

```
src/
├── main/                 # 主进程代码
├── preload/             # 预加载脚本
└── renderer/            # 渲染进程代码
    └── src/
        ├── components/  # React组件
        │   ├── Chat/   # 聊天相关组件
        │   ├── Pages/  # 页面组件
        │   └── ...
        ├── hooks/      # 自定义Hooks
        ├── api/        # API接口
        ├── types/      # TypeScript类型定义
        └── share/      # 共享工具和配置
```

## 🔑 主要组件

- **ChatArea**: 主聊天区域，处理消息显示和流式响应
- **NodeTreeView**: 树状节点视图，管理对话结构
- **SessionManager**: 会话管理，支持多会话切换
- **SettingsPage**: 设置页面，配置API和用户偏好
- **StreamingMarkdown**: 流式Markdown渲染组件

## ⚙️ 配置说明

应用支持以下配置项：

- **API配置**: API Key、Base URL、模型名称
- **系统提示词**: 自定义AI行为
- **主题设置**: 浅色/深色/跟随系统
- **MCP URLs**: 多模态内容处理URL配置