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

  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: '🏠' },
    { id: 'schedule', label: 'Расписание', icon: '🗓️' },
    { id: 'teachers', label: 'Преподаватели', icon: '👨‍🏫' },
    { id: 'labs', label: 'Мои лабы', icon: '📚' },
    { id: 'stats', label: 'Статистика', icon: '📈' },
  ];

  if (user?.role === 'GROUP_LEADER') {
    menuItems.push({ id: 'group', label: 'Моя группа', icon: '👥' });
  }

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
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    };
  };

  return (
    <>
      {/* 1. НЕВИДИМАЯ РАСПОРКА (Всегда 80px) */}
      {/* Она нужна, чтобы графики не уезжали в самый левый край экрана */}
      <div style={{ width: '80px', minWidth: '80px', flexShrink: 0, height: '100vh' }} />

      {/* 2. ПАРЯЩИЙ САЙДБАР (position: fixed) */}
      <div
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        style={{
          position: 'fixed', // Отвязываем меню от сетки! Оно теперь парит.
          top: 0,
          left: 0,
          height: '100vh',
          width: isCollapsed ? '80px' : '260px',
          
          // Супер-плавная и легкая анимация без нагрузки на браузер
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          
          background: 'var(--grad-sidebar)',
          color: 'white',
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999, // Поверх всего сайта
          boxShadow: isCollapsed ? 'none' : '10px 0 30px rgba(0,0,0,0.15)', // Тень появляется только при открытии
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
          whiteSpace: 'nowrap',
        }}>
          {isCollapsed ? '🎓' : 'PassPort 🎓'}
        </div>

        {/* Main Navigation */}
        <nav style={{ flex: 1, padding: '20px 10px', display: 'flex', flexDirection: 'column' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={getItemStyle(item.id) as React.CSSProperties}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
              <span style={{
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                transition: 'opacity 0.2s ease, transform 0.3s ease-out',
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
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (activeTab !== 'admin') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'admin') e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>⚙️</span>
              <span style={{ 
                opacity: isCollapsed ? 0 : 1, 
                transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
                transition: 'opacity 0.2s ease, transform 0.3s ease-out' 
              }}>
                Админка
              </span>
            </div>
          )}
        </nav>

        {/* Bottom Section: Profile & Logout */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
          <div
            onClick={() => setActiveTab('profile')}
            style={getItemStyle('profile') as React.CSSProperties}
            onMouseEnter={(e) => {
              if (activeTab !== 'profile') e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'profile') e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>👤</span>
            <span style={{ 
              opacity: isCollapsed ? 0 : 1, 
              transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
              transition: 'opacity 0.2s ease, transform 0.3s ease-out' 
            }}>
              Профиль
            </span>
          </div>

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
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff4d4f';
              e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-sand)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>🚪</span>
            <span style={{ 
              opacity: isCollapsed ? 0 : 1, 
              transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
              transition: 'opacity 0.2s ease, transform 0.3s ease-out' 
            }}>
              Выйти
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;