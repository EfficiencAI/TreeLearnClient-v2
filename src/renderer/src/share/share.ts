import { createContext, useContext } from 'react'

// 主题类型定义
export type Theme = 'light' | 'dark' | 'auto'

// 用户信息接口
export interface UserInfo {
  userId: string
  username: string
}

// 应用设置接口
export interface AppSettings {
  theme: Theme
  defaultModel: string
  messageHistoryDays: number
  autoSave: boolean
  // API配置
  apiKey: string
  baseUrl: string
  modelName: string
  systemPrompt: string
  mcpUrls: string[]
}

// 默认设置
export const defaultSettings: AppSettings = {
  theme: 'light',
  defaultModel: 'gpt-3.5',
  messageHistoryDays: 30,
  autoSave: true,
  // API配置默认值
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  modelName: 'gpt-3.5-turbo',
  systemPrompt: '你是一个有用的AI助手。',
  mcpUrls: []
}

// 设置上下文类型
export interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  isDarkMode: boolean
  toggleTheme: () => void
}

// 创建设置上下文
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// 自定义Hook来使用设置
export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// 本地存储键名
export const STORAGE_KEYS = {
  SETTINGS: 'treelearn_settings',
  CHAT_HISTORY: 'treelearn_chat_history',
  USER_PREFERENCES: 'treelearn_user_preferences',
  USER_INFO: 'treelearn_user_info'
} as const

// 存储工具函数
export const storage = {
  // 获取设置
  getSettings: (): AppSettings => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (stored) {
        const parsedSettings = JSON.parse(stored)
        // 确保所有新字段都有默认值（向后兼容）
        return {
          ...defaultSettings,
          ...parsedSettings,
          // 确保 mcpUrls 是数组
          mcpUrls: Array.isArray(parsedSettings.mcpUrls) ? parsedSettings.mcpUrls : []
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
    return defaultSettings
  },

  // 保存设置
  saveSettings: (settings: AppSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  // 获取用户信息
  getUserInfo: (): UserInfo | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load user info:', error)
    }
    return null
  },

  // 保存用户信息
  saveUserInfo: (userInfo: UserInfo): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
    } catch (error) {
      console.error('Failed to save user info:', error)
    }
  },

  // 清除用户信息
  clearUserInfo: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  },

  // 清除所有数据
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}

// 主题检测工具
export const themeUtils = {
  // 检测系统主题
  getSystemTheme: (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  },

  // 根据设置获取实际主题
  getActualTheme: (theme: Theme): 'light' | 'dark' => {
    if (theme === 'auto') {
      return themeUtils.getSystemTheme()
    }
    return theme
  },

  // 应用主题到DOM
  applyTheme: (theme: 'light' | 'dark'): void => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme'
    }
  }
}

// 事件总线类型
export interface EventBus {
  on: (event: string, callback: Function) => void
  off: (event: string, callback: Function) => void
  emit: (event: string, data?: any) => void
}

// 简单的事件总线实现
export const createEventBus = (): EventBus => {
  const events: { [key: string]: Function[] } = {}

  return {
    on: (event: string, callback: Function) => {
      if (!events[event]) {
        events[event] = []
      }
      events[event].push(callback)
    },

    off: (event: string, callback: Function) => {
      if (events[event]) {
        events[event] = events[event].filter(cb => cb !== callback)
      }
    },

    emit: (event: string, data?: any) => {
      if (events[event]) {
        events[event].forEach(callback => callback(data))
      }
    }
  }
}

// 全局事件总线实例
export const globalEventBus = createEventBus()

// 常用事件名称
export const EVENTS = {
  THEME_CHANGED: 'theme_changed',
  SETTINGS_UPDATED: 'settings_updated',
  CHAT_CREATED: 'chat_created',
  CHAT_DELETED: 'chat_deleted'
} as const