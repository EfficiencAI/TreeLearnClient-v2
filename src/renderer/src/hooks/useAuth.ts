import { useState, useEffect } from 'react'
import { storage, UserInfo } from '../share/share'
import apiClient from '../api/API' // 修改：使用默认导入

export const useAuth = () => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 验证用户身份
  const validateUser = async (userInfo: UserInfo): Promise<boolean> => {
    try {
      // 修改：使用导入的apiClient实例
      const response = await apiClient.getUser(userInfo.userId)
      return response.code === 200
    } catch (error) {
      console.error('User validation error:', error)
      return false
    }
  }

  // 登录用户
  const login = async (userInfo: UserInfo): Promise<boolean> => {
    const isValid = await validateUser(userInfo)
    if (isValid) {
      setUser(userInfo)
      setIsAuthenticated(true)
      storage.saveUserInfo(userInfo)
      return true
    }
    return false
  }

  // 退出登录
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    storage.clearUserInfo()
  }

  // 初始化时检查用户状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedUser = storage.getUserInfo()
      if (savedUser) {
        const isValid = await validateUser(savedUser)
        if (isValid) {
          setUser(savedUser)
          setIsAuthenticated(true)
        } else {
          // 用户信息无效，清除本地存储
          storage.clearUserInfo()
        }
      }
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  }
}