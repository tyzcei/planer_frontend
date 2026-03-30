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
    { id: 'labs', label: 'Мои лабы', icon: '📚' },
    { id: 'stats', label: 'Статистика', icon: '📈' },
  ];

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div style={{ padding: '25px', fontSize: '24px', textAlign: 'center' }}>
        {isCollapsed ? '🎓' : 'PassPort 🎓'}
      </div>

      <nav style={{ flex: 1, padding: '10px' }}>
        {menuItems.map(item => (
          <div 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '15px', borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '15px',
              background: activeTab === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: '0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </div>
        ))}
        {/* Код для вставки после завершения item.map(...) */}
        {user?.role === 'ADMIN' && (
          <div 
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '15px', borderRadius: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '15px',
              background: activeTab === 'admin' ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: '0.2s',
              marginTop: '10px',
              borderTop: '1px solid rgba(255,255,255,0.05)' // Чтобы визуально отделить
            }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            {!isCollapsed && <span>Админка</span>}
          </div>
        )}
      </nav>

      <div onClick={onLogout} style={{ padding: '25px', cursor: 'pointer', color: '#ff4d4f', display: 'flex', gap: '15px' }}>
        <span>🚪</span>
        {!isCollapsed && <span>Выйти</span>}
      </div>
    </div>
  );
};

export default Sidebar;