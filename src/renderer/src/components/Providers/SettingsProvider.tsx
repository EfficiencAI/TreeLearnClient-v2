import React, { useState, useEffect, ReactNode } from 'react'
import {
  AppSettings,
  SettingsContextType,
  defaultSettings,
  storage,
  themeUtils,
  globalEventBus,
  EVENTS,
  SettingsContext
} from '../../share/share'

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 初始化设置
  useEffect(() => {
    const loadedSettings = storage.getSettings()
    setSettings(loadedSettings)

    const actualTheme = themeUtils.getActualTheme(loadedSettings.theme)
    setIsDarkMode(actualTheme === 'dark')
    themeUtils.applyTheme(actualTheme)

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (): void => {
      if (loadedSettings.theme === 'auto') {
        const newTheme = themeUtils.getSystemTheme()
        setIsDarkMode(newTheme === 'dark')
        themeUtils.applyTheme(newTheme)
        globalEventBus.emit(EVENTS.THEME_CHANGED, newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  // 更新设置
  const updateSettings = (newSettings: Partial<AppSettings>): void => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    storage.saveSettings(updatedSettings)

    // 如果主题发生变化，立即应用
    if (newSettings.theme !== undefined) {
      const actualTheme = themeUtils.getActualTheme(updatedSettings.theme)
      setIsDarkMode(actualTheme === 'dark')
      themeUtils.applyTheme(actualTheme)
      globalEventBus.emit(EVENTS.THEME_CHANGED, actualTheme)
    }

    globalEventBus.emit(EVENTS.SETTINGS_UPDATED, updatedSettings)
  }

  // 切换主题
  const toggleTheme = (): void => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    updateSettings({ theme: newTheme })
  }

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    isDarkMode,
    toggleTheme
  }

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>
}

export default SettingsProvider
