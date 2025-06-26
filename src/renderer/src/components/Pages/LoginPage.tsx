import React, { useState } from 'react'
import apiClient from '../../api/API'
import './Pages.css'

interface LoginPageProps {
  onLoginSuccess: (userInfo: { userId: string; username: string }) => void
  onSwitchToRegister: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId.trim()) {
      setError('请输入用户ID')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 验证用户是否存在
      const response = await apiClient.getUser(userId.trim())
      
      if (response.code === 200 && response.obj) {
        onLoginSuccess({ 
          userId: userId.trim(), 
          username: response.obj.username || userId.trim() 
        })
      } else {
        setError('用户不存在，请检查用户ID或注册新账号')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('登录失败，请检查网络连接后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="register-container">
        <h2>用户登录</h2>
        <p>请输入您的用户ID登录TreeLearn</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="userId">用户ID:</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="请输入用户ID"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="switch-auth">
          <p>还没有账号？ 
            <button 
              type="button" 
              onClick={onSwitchToRegister}
              className="link-btn"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage