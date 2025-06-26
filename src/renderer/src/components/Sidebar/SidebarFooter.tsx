import React from 'react'
import { useSettings } from '../../share/share'
import { useAuth } from '../../hooks/useAuth'

const SidebarFooter: React.FC = () => {
  const { isDarkMode, toggleTheme } = useSettings()
  const { user, logout } = useAuth()

  const handleLogout = (): void => {
    if (confirm('确定要退出登录吗？')) {
      logout()
    }
  }

  return (
    <div className="sidebar-footer">
      <div className="user-info">
        <div className="avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
        <div className="username">{user?.username || 'Unknown User'}</div>
      </div>
      <div className="footer-actions">
        <button className="theme-toggle" onClick={toggleTheme} title="切换主题">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button className="logout-btn" onClick={handleLogout} title="退出登录">
          🚪
        </button>
      </div>
    </div>
  )
}

export default SidebarFooter
