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

  // Основные разделы
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: '🏠' },
    { id: 'schedule', label: 'Расписание', icon: '🗓️' },
    { id: 'teachers', label: 'Преподаватели', icon: '👨‍🏫' },
    { id: 'labs', label: 'Мои лабы', icon: '📚' },
    { id: 'stats', label: 'Статистика', icon: '📈' },
  ];

  // Динамически добавляем вкладку старосты
  if (user?.role === 'GROUP_LEADER') {
    menuItems.push({ id: 'group', label: 'Моя группа', icon: '👥' });
  }

  // Общий стиль для элементов навигации
  const getItemStyle = (id: string) => {
    const isActive = activeTab === id;
    return {
      padding: '15px',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      background: isActive ? 'var(--color-purple)' : 'transparent',
      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
      transition: 'all 0.2s ease',
      marginBottom: '5px',
    };
  };

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
        boxShadow: '4px 0 15px rgba(15, 45, 77, 0.1)',
        height: '100vh',
      }}
    >
      {/* Logo */}
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

      {/* Main Navigation */}
      <nav style={{ flex: 1, padding: '20px 10px' }}>
        {menuItems.map(item => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={getItemStyle(item.id)}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 0.3s ease',
              whiteSpace: 'nowrap',
              fontWeight: activeTab === item.id ? '600' : 'normal'
            }}>
              {item.label}
            </span>
          </div>
        ))}

        {/* Admin Section */}
        {user?.role === 'ADMIN' && (
          <div
            onClick={() => setActiveTab('admin')}
            style={{
              ...getItemStyle('admin'),
              marginTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px'
            }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span style={{ opacity: isCollapsed ? 0 : 1, transition: '0.3s', whiteSpace: 'nowrap' }}>Админка</span>
          </div>
        )}
      </nav>

      {/* Bottom Section: Profile & Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
        
        {/* Profile Link */}
        <div
          onClick={() => setActiveTab('profile')}
          style={getItemStyle('profile')}
          onMouseEnter={(e) => {
            if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'profile') e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: '20px' }}>👤</span>
          <span style={{ 
            opacity: isCollapsed ? 0 : 1, 
            transition: 'opacity 0.3s ease', 
            whiteSpace: 'nowrap' 
          }}>Профиль</span>
        </div>

        {/* Logout */}
        <div
          onClick={onLogout}
          style={{
            padding: '15px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            color: 'var(--color-sand)',
            transition: '0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4f'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-sand)'}
        >
          <span style={{ fontSize: '20px' }}>🚪</span>
          <span style={{ 
            opacity: isCollapsed ? 0 : 1, 
            transition: 'opacity 0.3s ease', 
            whiteSpace: 'nowrap' 
          }}>Выйти</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;