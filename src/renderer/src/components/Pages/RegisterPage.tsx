import React, { useState } from 'react'
import { CreateUserParams } from '../../api/API'
import apiClient from '../../api/API'
import './Pages.css'

interface RegisterPageProps {
  onRegisterSuccess: (userInfo: { userId: string; username: string }) => void
  onSwitchToLogin: () => void // 新增
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [userId, setUserId] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userId.trim() || !username.trim()) {
      setError('请填写完整的用户信息')
      return
    }

    setLoading(true)
    setError('')

    try {
      const params: CreateUserParams = {
        userId: userId.trim(),
        username: username.trim()
      }

      const response = await apiClient.createUser(params)
      
      if (response.code === 200) {
        onRegisterSuccess({ userId: userId.trim(), username: username.trim() })
      } else {
        setError(response.msg || '注册失败，请重试')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="register-container">
        <h2>用户注册</h2>
        <p>请注册您的账户以使用TreeLearn</p>
        
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

          <div className="form-group">
            <label htmlFor="username">用户名:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="switch-auth">
          <p>已有账号？ 
            <button 
              type="button" 
              onClick={onSwitchToLogin}
              className="link-btn"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage