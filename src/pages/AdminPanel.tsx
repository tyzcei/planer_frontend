import { useState, useEffect } from 'react';
import api from '../api';

const AdminPanel = () => {
  // --- Состояния ---
  const [users, setUsers] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  
  const [syncGroup, setSyncGroup] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // --- Загрузка данных ---
  const fetchData = async () => {
    try {
      const [usersRes, groupsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/groups')
      ]);
      setUsers(usersRes.data);
      setAvailableGroups(groupsRes.data);
    } catch (e) {
      alert("Доступ запрещен или ошибка сервера");
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // --- Действия администратора ---
  const changeRole = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role?newRole=${newRole}`);
      fetchData(); 
    } catch (e) {
      alert("Не удалось сменить роль");
    }
  };

  const changeGroup = async (userId: number, newGroup: string) => {
    try {
      await api.patch(`/admin/users/${userId}/group?groupNumber=${newGroup}`);
      fetchData();
    } catch (e) {
      alert("Не удалось сменить группу");
    }
  };

  const toggleBlock = async (userId: number, currentBlockStatus: boolean) => {
    const newStatus = !currentBlockStatus;
    const action = newStatus ? "заблокировать" : "разблокировать";
    if (!window.confirm(`Вы уверены, что хотите ${action} пользователя?`)) return;

    try {
      await api.patch(`/admin/users/${userId}/block?block=${newStatus}`);
      fetchData();
    } catch (e) {
      alert("Ошибка при изменении статуса блокировки");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm("ВНИМАНИЕ! Вы уверены, что хотите НАВСЕГДА удалить пользователя?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (e) {
      alert("Ошибка при удалении пользователя");
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
      setSyncGroup(''); 
      fetchData(); // Обновляем список групп, если появилась новая
    } catch (error) {
      setSyncMessage({ type: 'error', text: '❌ Ошибка синхронизации. Проверьте номер группы.' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* DATALIST для выпадающего списка групп с поиском */}
      <datalist id="available-groups">
        {availableGroups.map(group => (
          <option key={group} value={group} />
        ))}
      </datalist>

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
            list="available-groups"
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
          🛡️ Пользователи системы
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '15px', color: 'var(--text-gray)' }}>Пользователь</th>
                <th style={{ color: 'var(--text-gray)' }}>Группа</th>
                <th style={{ color: 'var(--text-gray)' }}>Роль</th>
                <th style={{ color: 'var(--text-gray)' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.userId} style={{ 
                  borderBottom: '1px solid #f8fafc', transition: '0.2s',
                  background: u.blocked ? '#fff1f2' : 'transparent',
                  opacity: u.blocked ? 0.7 : 1
                }} 
                onMouseOver={(e) => {if(!u.blocked) e.currentTarget.style.background = '#f8fafc'}} 
                onMouseOut={(e) => {if(!u.blocked) e.currentTarget.style.background = 'transparent'}}>
                  
                  {/* Email и Статус */}
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600', color: u.blocked ? '#e11d48' : 'var(--color-dark-navy)' }}>
                      {u.email} {u.blocked && '🚫 (Заблокирован)'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>
                      {u.firstName} {u.lastName}
                    </div>
                  </td>

                  {/* Смена Группы */}
                  <td>
                    <input 
                      list="available-groups"
                      defaultValue={u.groupNumber || ''}
                      onBlur={(e) => {
                        if(e.target.value !== u.groupNumber) changeGroup(u.userId, e.target.value);
                      }}
                      placeholder="Нет группы"
                      style={{ 
                        padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        width: '120px', outline: 'none'
                      }}
                    />
                  </td>

                  {/* Смена Роли */}
                  <td>
                    <select 
                      onChange={(e) => changeRole(u.userId, e.target.value)}
                      value={u.role}
                      disabled={u.blocked}
                      style={{ 
                        padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: 'white', color: 'var(--color-dark-navy)', cursor: u.blocked ? 'not-allowed' : 'pointer', outline: 'none'
                      }}
                    >
                      <option value="STUDENT">Студент</option>
                      <option value="GROUP_LEADER">Староста</option>
                      <option value="ADMIN">Админ</option>
                    </select>
                  </td>

                  {/* Кнопки Блокировки и Удаления */}
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => toggleBlock(u.userId, u.blocked)}
                        title={u.blocked ? "Разблокировать" : "Заблокировать"}
                        style={{
                          background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer',
                          filter: u.blocked ? 'grayscale(0%)' : 'grayscale(100%)'
                        }}
                      >
                        {u.blocked ? '✅' : '🚫'}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.userId)}
                        title="Удалить навсегда"
                        style={{
                          background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
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