import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './Pages.css'
import { useSettings, themeUtils } from '../../share/share'

interface GitHubPageProps {
  onBack: () => void
}

type DocumentType = 'client' | 'server'

const GitHubPage: React.FC<GitHubPageProps> = ({ onBack }) => {
  const [activeDoc, setActiveDoc] = useState<DocumentType>('client')
  const [clientContent, setClientContent] = useState<string>('')
  const [serverContent, setServerContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  
  // 使用应用的主题设置
  const { settings } = useSettings()
  const actualTheme = themeUtils.getActualTheme(settings.theme)

  // 读取markdown文件内容
  useEffect(() => {
    const loadMarkdownFiles = async (): Promise<void> => {
      try {
        setLoading(true)

        // 读取客户端文档
        const clientResponse = await fetch('/document/README_client.md')
        if (!clientResponse.ok) {
          throw new Error('Failed to load client documentation')
        }
        const clientText = await clientResponse.text()
        setClientContent(clientText)

        // 读取服务端文档
        const serverResponse = await fetch('/document/README_server.md')
        if (!serverResponse.ok) {
          throw new Error('Failed to load server documentation')
        }
        const serverText = await serverResponse.text()
        setServerContent(serverText)

        setLoading(false)
      } catch (err) {
        console.error('Error loading markdown files:', err)
        setError('无法加载文档文件')
        setLoading(false)
      }
    }

    loadMarkdownFiles()
  }, [])

  const handleOpenGitHub = (): void => {
    window.open('https://github.com/EfficiencAI/TreeLearnClient-v2', '_blank')
  }

  const handleOpenServerGitHub = (): void => {
    window.open('https://github.com/EfficiencAI/TreeLearn', '_blank')
  }

  const getCurrentContent = (): string => {
    return activeDoc === 'client' ? clientContent : serverContent
  }

  const getDocumentTitle = (): string => {
    return activeDoc === 'client' ? 'TreeLearn Client v2' : 'TreeLearn Server'
  }

  return (
    <div className={`page-container github-page-container ${actualTheme}`}>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <h2>GitHub 项目文档</h2>
      </div>

      <div className="page-content">
        {/* GitHub链接区域 */}
        <div className="github-info">
          <div className="github-icon">🐙</div>
          <h3>TreeLearn 项目</h3>
          <p className="repo-desc">基于Electron的AI聊天客户端与Spring Boot服务端</p>

          <div className="github-buttons">
            <button className="github-btn" onClick={handleOpenGitHub}>
              <span>🔗</span>
              访问客户端GitHub仓库
            </button>
            <button className="github-btn" onClick={handleOpenServerGitHub}>
              <span>🔗</span>
              访问服务端GitHub仓库
            </button>
          </div>
        </div>

        {/* 文档切换区域 */}
        <div className="doc-switcher">
          <div className="doc-tabs">
            <button
              className={`doc-tab ${activeDoc === 'client' ? 'active' : ''}`}
              onClick={() => setActiveDoc('client')}
            >
              📱 客户端文档
            </button>
            <button
              className={`doc-tab ${activeDoc === 'server' ? 'active' : ''}`}
              onClick={() => setActiveDoc('server')}
            >
              🖥️ 服务端文档
            </button>
          </div>
        </div>

        {/* 文档内容区域 */}
        <div className="doc-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>正在加载文档...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="markdown-container">
              <div className="doc-header">
                <h1>{getDocumentTitle()}</h1>
              </div>
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {getCurrentContent()}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GitHubPage
