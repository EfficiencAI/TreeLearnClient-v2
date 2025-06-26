export interface ChatItem {
  id: number
  icon: string
  title: string
  preview: string
  timestamp?: string
}
export interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}
export interface ThemeContextType {
  darkMode: boolean
  toggleTheme: () => void
}
