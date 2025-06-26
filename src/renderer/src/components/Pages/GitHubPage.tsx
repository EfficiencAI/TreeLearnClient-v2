import React from 'react'
import './Pages.css'

interface GitHubPageProps {
  onBack: () => void
}

const GitHubPage: React.FC<GitHubPageProps> = ({ onBack }) => {
  const handleOpenGitHub = () => {
    // 在Electron中打开外部链接
    window.open('https://github.com/your-username/TreeLearnClient-v2', '_blank')
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <h2>GitHub</h2>
      </div>
      <div className="page-content">
        <div className="github-info">
          <div className="github-icon">🐙</div>
          <h3>TreeLearnClient-v2</h3>
          <p className="repo-desc">基于Electron的AI聊天客户端</p>
          
          <button className="github-btn" onClick={handleOpenGitHub}>
            <span>🔗</span>
            访问 GitHub 仓库
          </button>
        </div>
        
        <div className="repo-stats">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span className="stat-label">Stars</span>
            <span className="stat-value">128</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🍴</span>
            <span className="stat-label">Forks</span>
            <span className="stat-value">32</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🐛</span>
            <span className="stat-label">Issues</span>
            <span className="stat-value">5</span>
          </div>
        </div>
        
        <div className="info-group">
          <h4>贡献指南</h4>
          <p>
            欢迎提交 Issue 和 Pull Request！
            在贡献代码前，请先阅读我们的贡献指南。
          </p>
          <ul>
            <li>Fork 项目到你的 GitHub</li>
            <li>创建功能分支</li>
            <li>提交你的修改</li>
            <li>发起 Pull Request</li>
          </ul>
        </div>
        
        <div className="info-group">
          <h4>许可证</h4>
          <p>
            本项目采用 MIT 许可证，详情请查看 LICENSE 文件。
          </p>
        </div>
      </div>
    </div>
  )
}

export default GitHubPage