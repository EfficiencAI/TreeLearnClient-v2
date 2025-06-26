import React from 'react'
import './Pages.css'

interface VersionPageProps {
  onBack: () => void
}

const VersionPage: React.FC<VersionPageProps> = ({ onBack }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <h2>版本信息</h2>
      </div>
      <div className="page-content">
        <div className="version-info">
          <div className="app-icon">🌳</div>
          <h3>TreeLearn Client</h3>
          <p className="version">版本 2.0.0</p>
          <p className="build">构建号: 20241201</p>
        </div>
        
        <div className="info-group">
          <h4>更新日志</h4>
          <div className="changelog">
            <div className="changelog-item">
              <strong>v2.0.0</strong>
              <ul>
                <li>全新的用户界面设计</li>
                <li>支持多模型对话</li>
                <li>优化聊天体验</li>
                <li>添加主题切换功能</li>
              </ul>
            </div>
            <div className="changelog-item">
              <strong>v1.5.0</strong>
              <ul>
                <li>修复已知问题</li>
                <li>性能优化</li>
                <li>界面细节调整</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="info-group">
          <h4>技术栈</h4>
          <div className="tech-stack">
            <span className="tech-item">Electron</span>
            <span className="tech-item">React</span>
            <span className="tech-item">TypeScript</span>
            <span className="tech-item">Vite</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionPage