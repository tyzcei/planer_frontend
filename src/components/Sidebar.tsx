import { useState } from 'react';
import { getUserData } from '../utils/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const user = getUserData();

  // Базовые элементы меню для всех
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: '🏠' },
    { id: 'schedule', label: 'Расписание', icon: '🗓️' },
    { id: 'labs', label: 'Мои лабы', icon: '📚' },
    { id: 'stats', label: 'Статистика', icon: '📈' },
  ];

  // Динамически добавляем вкладку старосты
  if (user?.role === 'GROUP_LEADER') {
    menuItems.push({ id: 'group', label: 'Моя группа', icon: '👥' });
  }

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      style={{
        width: isCollapsed ? '80px' : '260px',
        transition: 'width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        background: 'var(--grad-sidebar)',
        color: 'white',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '4px 0 15px rgba(15, 45, 77, 0.1)'
      }}
    >
      <div style={{ 
        padding: '30px 25px', 
        fontSize: '22px', 
        fontWeight: 'bold',
        textAlign: isCollapsed ? 'center' : 'left',
        color: 'var(--color-sand)', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        whiteSpace: 'nowrap'
      }}>
        {isCollapsed ? '🎓' : 'PassPort 🎓'}
      </div>

      <nav style={{ flex: 1, padding: '20px 10px' }}>
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: '15px', 
                borderRadius: '12px', 
                cursor: 'pointer',
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                background: isActive ? 'var(--color-purple)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.2s ease',
                marginBottom: '5px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ 
                opacity: isCollapsed ? 0 : 1, 
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? '600' : 'normal'
              }}>
                {item.label}
              </span>
            </div>
          );
        })}

        {/* Админка остается отдельным блоком, чтобы отделить её визуально полоской */}
        {user?.role === 'ADMIN' && (
          <div 
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '15px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              background: activeTab === 'admin' ? 'var(--color-purple)' : 'transparent',
              color: activeTab === 'admin' ? 'white' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s',
              marginTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.1)' 
            }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span style={{ opacity: isCollapsed ? 0 : 1, transition: '0.3s', whiteSpace: 'nowrap' }}>Админка</span>
          </div>
        )}
      </nav>

      <div 
        onClick={onLogout} 
        style={{ 
          padding: '25px', 
          cursor: 'pointer', 
          color: 'var(--color-sand)',
          display: 'flex', 
          alignItems: 'center',
          gap: '15px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          transition: '0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4f'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-sand)'}
      >
        <span style={{ fontSize: '20px' }}>🚪</span>
        <span style={{ opacity: isCollapsed ? 0 : 1, transition: '0.3s', whiteSpace: 'nowrap' }}>Выйти</span>
      </div>
    </div>
  );
};

export default Sidebar;