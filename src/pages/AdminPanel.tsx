import { useState, useEffect } from 'react';
import api from '../api';

const AdminPanel = () => {
  // --- Состояния для пользователей ---
  const [users, setUsers] = useState<any[]>([]);

  // --- Состояния для синхронизации преподавателей ---
  const [syncGroup, setSyncGroup] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Загрузка пользователей ---
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      alert("Доступ запрещен или ошибка сервера");
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role?newRole=${newRole}`);
      fetchUsers(); // Обновляем список
    } catch (e) {
      alert("Не удалось сменить роль");
    }
  };

  // --- Функция точечной синхронизации ---
  const handleSyncGroup = async () => {
    if (!syncGroup.trim()) {
      setSyncMessage({ type: 'error', text: 'Сначала введите номер группы!' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await api.post(`/teachers/force-sync/${syncGroup}`);
      setSyncMessage({ type: 'success', text: `✅ Преподаватели группы ${syncGroup} обновлены!` });
      setSyncGroup(''); // Очищаем поле после успеха
    } catch (error) {
      console.error(error);
      setSyncMessage({ type: 'error', text: '❌ Ошибка синхронизации. Проверьте номер группы.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Панель Администратора ⚙️</h1>
        <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
          Управление доступом и системными процессами Semester Passport.
        </p>
      </div>

      {/* === БЛОК 1: СИНХРОНИЗАЦИЯ БГУИР === */}
      <div style={{ 
        background: 'white', padding: '25px', borderRadius: '20px', 
        marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' 
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-dark-navy)' }}>
          🔄 Интеграция расписания (БГУИР)
        </h3>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '15px' }}>
          Введите номер группы (например, 314302), чтобы принудительно подтянуть или обновить список её преподавателей из API БГУИР.
        </p>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Номер группы..." 
            value={syncGroup}
            onChange={(e) => setSyncGroup(e.target.value)}
            style={{ 
              padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', 
              outline: 'none', width: '200px', fontSize: '1rem' 
            }}
          />
          <button 
            onClick={handleSyncGroup}
            disabled={isSyncing}
            style={{ 
              background: isSyncing ? '#cbd5e1' : 'var(--color-purple)', 
              color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', 
              cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s'
            }}
          >
            {isSyncing ? '⏳ Загрузка...' : 'Обновить преподавателей'}
          </button>

          {syncMessage && (
            <span style={{ 
              fontSize: '0.9rem', fontWeight: 'bold',
              color: syncMessage.type === 'success' ? '#166534' : '#991b1b',
              background: syncMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
              padding: '8px 12px', borderRadius: '8px'
            }}>
              {syncMessage.text}
            </span>
          )}
        </div>
      </div>

      {/* === БЛОК 2: УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ === */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-dark-navy)' }}>
          🛡️ Роли и доступы
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '15px', color: 'var(--text-gray)' }}>Email</th>
                <th style={{ color: 'var(--text-gray)' }}>Группа</th>
                <th style={{ color: 'var(--text-gray)' }}>Текущая роль</th>
                <th style={{ color: 'var(--text-gray)' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '15px', fontWeight: '500', color: 'var(--color-dark-navy)' }}>{u.email}</td>
                  <td>{u.groupNumber || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                  <td>
                    <span style={{ 
                      background: u.role === 'ADMIN' ? '#fee2e2' : u.role === 'GROUP_LEADER' ? '#fef08a' : '#f1f5f9', 
                      color: u.role === 'ADMIN' ? '#991b1b' : u.role === 'GROUP_LEADER' ? '#854d0e' : '#475569',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold'
                    }}>
                      {u.role === 'GROUP_LEADER' ? 'СТАРОСТА' : u.role}
                    </span>
                  </td>
                  <td>
                    <select 
                      onChange={(e) => changeRole(u.userId, e.target.value)}
                      value={u.role}
                      style={{ 
                        padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: 'white', color: 'var(--color-dark-navy)', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value="STUDENT">Студент</option>
                      <option value="GROUP_LEADER">Староста</option>
                      <option value="ADMIN">Админ</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminPanel;