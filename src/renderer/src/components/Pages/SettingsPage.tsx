import React, { useState } from 'react'
import { useSettings } from '../../share/share'
import './Pages.css'

interface SettingsPageProps {
  onBack: () => void
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { settings, updateSettings } = useSettings()
  const [mcpUrlInput, setMcpUrlInput] = useState('')

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    updateSettings({ theme: event.target.value as 'light' | 'dark' | 'auto' })
  }
  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateSettings({ apiKey: event.target.value })
  }

  const handleBaseUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateSettings({ baseUrl: event.target.value })
  }

  const handleModelNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    updateSettings({ modelName: event.target.value })
  }

  const handleSystemPromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    updateSettings({ systemPrompt: event.target.value })
  }

  const handleAddMcpUrl = (): void => {
    const currentUrls = settings.mcpUrls || []
    if (mcpUrlInput.trim() && !currentUrls.includes(mcpUrlInput.trim())) {
      updateSettings({ mcpUrls: [...currentUrls, mcpUrlInput.trim()] })
      setMcpUrlInput('')
    }
  }

  const handleRemoveMcpUrl = (index: number): void => {
    const currentUrls = settings.mcpUrls || []
    const newUrls = currentUrls.filter((_, i) => i !== index)
    updateSettings({ mcpUrls: newUrls })
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <h2>设置</h2>
      </div>
      <div className="page-content">
        <div className="setting-group">
          <h3>外观</h3>
          <div className="setting-item">
            <label>主题模式</label>
            <select value={settings.theme} onChange={handleThemeChange}>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">跟随系统</option>
            </select>
          </div>
        </div>

        <div className="setting-group">
          <h3>API配置</h3>
          <div className="setting-item">
            <label>API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder="请输入您的API Key"
            />
          </div>
          <div className="setting-item">
            <label>Base URL</label>
            <input
              type="url"
              value={settings.baseUrl}
              onChange={handleBaseUrlChange}
              placeholder="https://api.openai.com/v1"
            />
          </div>
          <div className="setting-item">
            <label>模型名称</label>
            <input
              type="text"
              value={settings.modelName}
              onChange={handleModelNameChange}
              placeholder="gpt-3.5-turbo"
            />
          </div>
          <div className="setting-item">
            <label>系统提示词</label>
            <textarea
              value={settings.systemPrompt}
              onChange={handleSystemPromptChange}
              placeholder="请输入系统提示词"
              rows={3}
            />
          </div>
          <div className="setting-item">
            <label>MCP URLs</label>
            <div className="mcp-urls-container">
              <div className="mcp-input-group">
                <input
                  type="url"
                  value={mcpUrlInput}
                  onChange={(e) => setMcpUrlInput(e.target.value)}
                  placeholder="请输入MCP URL"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMcpUrl()}
                />
                <button type="button" onClick={handleAddMcpUrl} className="add-btn">
                  添加
                </button>
              </div>
              <div className="mcp-urls-list">
                {(settings.mcpUrls || []).map((url, index) => (
                  <div key={index} className="mcp-url-item">
                    <span>{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMcpUrl(index)}
                      className="remove-btn"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="setting-group">
          <h3>快捷键</h3>
          <div className="setting-item">
            <label>发送消息</label>
            <span className="shortcut">Ctrl + Enter</span>
          </div>
          <div className="setting-item">
            <label>新建对话</label>
            <span className="shortcut">Ctrl + N</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
