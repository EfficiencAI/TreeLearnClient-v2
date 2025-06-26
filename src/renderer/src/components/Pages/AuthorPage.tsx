import React from 'react'
import './Pages.css'

interface AuthorPageProps {
  onBack: () => void
}

const AuthorPage: React.FC<AuthorPageProps> = ({ onBack }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <h2>关于作者</h2>
      </div>
      <div className="page-content">
        <div className="author-info">
          <div className="author-avatar">👨‍💻</div>
          <h3>开发者</h3>
          <p className="author-name">TreeLearn Team</p>
          <p className="author-desc">致力于打造更好的AI学习工具</p>
        </div>
        
        <div className="contact-info">
          <h4>联系方式</h4>
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <span>contact@treelearn.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🌐</span>
            <span>https://treelearn.com</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🐦</span>
            <span>@TreeLearnAI</span>
          </div>
        </div>
        
        <div className="info-group">
          <h4>项目理念</h4>
          <p>
            TreeLearn 旨在通过AI技术帮助用户更好地学习和工作。
            我们相信技术应该让学习变得更加高效和有趣。
          </p>
        </div>
        
        <div className="info-group">
          <h4>特别感谢</h4>
          <p>
            感谢所有为这个项目贡献代码、提供反馈和支持的朋友们。
            正是有了大家的帮助，TreeLearn 才能不断进步。
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthorPage