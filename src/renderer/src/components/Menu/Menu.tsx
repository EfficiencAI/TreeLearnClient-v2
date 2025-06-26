import React, { useRef, useEffect } from 'react'
import './Menu.css'

interface MenuProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (page: string) => void
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onNavigate, buttonRef }) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && buttonRef?.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const menu = menuRef.current

      // 设置菜单位置在按钮下方
      menu.style.top = `${buttonRect.bottom + 8}px`
      menu.style.left = `${buttonRect.right - 200}px` // 右对齐
    }
  }, [isOpen, buttonRef])

  if (!isOpen) return null

  const menuItems = [
    { id: 'settings', label: '设置', icon: '⚙️' },
    { id: 'version', label: '版本信息', icon: 'ℹ️' },
    { id: 'author', label: '作者', icon: '👤' },
    { id: 'github', label: 'GitHub', icon: '🔗' },
    { id: 'logout', label: '退出登录', icon: '🚪' }
  ]

  const handleItemClick = (itemId: string): void => {
    onNavigate(itemId)
    onClose()
  }

  return (
    <>
      <div className="menu-overlay" onClick={onClose} />
      <div ref={menuRef} className="menu-dropdown">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item" onClick={() => handleItemClick(item.id)}>
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
            <span className="menu-arrow">›</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default Menu
