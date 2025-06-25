// src/App.tsx
import React, { useState } from 'react';
import './assets/ChatPage.css';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeChat, setActiveChat] = useState(1);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">DS</div>
            <span>DeepSeek Chat</span>
          </div>
          <button className="new-chat-btn">
            <span className="plus-icon">+</span> New Chat
          </button>
        </div>

        <div className="chat-history">
          <div className="section-title">Today</div>
          <div 
            className={`chat-item ${activeChat === 1 ? 'active' : ''}`} 
            onClick={() => setActiveChat(1)}
          >
            <div className="chat-icon">💡</div>
            <div className="chat-info">
              <div className="chat-title">React性能优化方案</div>
              <div className="chat-preview">关于React.memo和useMemo的使用场景...</div>
            </div>
          </div>
          <div 
            className={`chat-item ${activeChat === 2 ? 'active' : ''}`} 
            onClick={() => setActiveChat(2)}
          >
            <div className="chat-icon">🤖</div>
            <div className="chat-info">
              <div className="chat-title">AI模型比较</div>
              <div className="chat-preview">GPT-4和Claude 3的主要区别在于...</div>
            </div>
          </div>
          
          <div className="section-title">Yesterday</div>
          <div 
            className={`chat-item ${activeChat === 3 ? 'active' : ''}`} 
            onClick={() => setActiveChat(3)}
          >
            <div className="chat-icon">🚀</div>
            <div className="chat-info">
              <div className="chat-title">Electron应用架构</div>
              <div className="chat-preview">主进程和渲染进程的通信方式...</div>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">U</div>
            <div className="username">user@example.com</div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="chat-header">
          <div className="model-info">
            <span className="model-badge">DeepSeek-R1</span>
            <span className="model-desc">128K上下文 · 知识更新至2024年7月</span>
          </div>
          <div className="chat-actions">
            <button className="action-btn">↻</button>
            <button className="action-btn">⋮</button>
          </div>
        </div>

        <div className="message-container">
          <div className="message ai-message">
            <div className="avatar">AI</div>
            <div className="message-content">
              <p>你好！我是DeepSeek助手，有什么可以帮您的吗？</p>
              <div className="message-tools">
                <button>👍</button>
                <button>👎</button>
                <button>↻</button>
                <button>复制</button>
              </div>
            </div>
          </div>

          <div className="message user-message">
            <div className="avatar">U</div>
            <div className="message-content">
              <p>请帮我解释一下TypeScript中的泛型概念，最好能举个实际应用的例子。</p>
              <div className="message-tools">
                <button>↻</button>
                <button>复制</button>
              </div>
            </div>
          </div>

          <div className="message ai-message">
            <div className="avatar">AI</div>
            <div className="message-content">
              <p>当然可以！TypeScript中的泛型（Generics）是一种创建可复用代码组件的工具，它允许我们创建可以处理多种类型而不是单一类型的组件。</p>
              
              <p><strong>基本概念：</strong></p>
              <p>泛型为我们提供了类型变量，这是一种特殊的变量，只用于表示类型而不是值。</p>
              
              <p><strong>简单示例：</strong></p>
              <pre>{`function identity<T>(arg: T): T {
  return arg;
}

// 使用
let output = identity<string>("hello");  // 类型为string
let output2 = identity<number>(42);     // 类型为number`}</pre>
              
              <p><strong>实际应用场景：</strong></p>
              <p>1. 创建可重用的React组件：</p>
              <pre>{`interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// 使用
<List<number> 
  items={[1, 2, 3]} 
  renderItem={(item) => <span>{item}</span>} 
/>`}</pre>
              
              <p>2. API响应类型：</p>
              <pre>{`interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 用户数据响应
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "John" },
  status: 200,
  message: "Success"
};

// 产品数据响应
const productResponse: ApiResponse<Product> = {
  data: { id: 101, title: "Laptop", price: 999 },
  status: 200,
  message: "Success"
};`}</pre>
              
              <p>泛型在TypeScript中非常强大，它们帮助我们在保持类型安全的同时提高代码的灵活性。</p>
              <div className="message-tools">
                <button>👍</button>
                <button>👎</button>
                <button>↻</button>
                <button>复制</button>
              </div>
            </div>
          </div>
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea 
              placeholder="Message DeepSeek-R1..." 
              rows={1}
            ></textarea>
            <button className="send-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="input-footer">
            <p>DeepSeek-R1可以生成不准确的信息，请务必验证重要信息</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;