import { useState, useEffect } from 'react';
import api from '../api';

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      alert("Доступ запрещен или ошибка сервера");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role?newRole=${newRole}`);
      fetchUsers(); // Обновляем список
    } catch (e) {
      alert("Не удалось сменить роль");
    }
  };

  return (
    <div className="fade-in">
      <h1 style={{ color: 'var(--primary-blue)' }}>Управление пользователями 🛡️</h1>
      <table style={{ width: '100%', background: 'white', borderRadius: '15px', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: '15px' }}>Email</th>
            <th>Группа</th>
            <th>Текущая роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.userId} style={{ borderBottom: '1px solid #f9f9f9' }}>
              <td style={{ padding: '15px' }}>{u.email}</td>
              <td>{u.groupNumber || '—'}</td>
              <td>
                <span className="status-badge" style={{ 
                  background: u.role === 'ADMIN' ? 'var(--error-red)' : '#eee', 
                  color: u.role === 'ADMIN' ? 'white' : '#333' 
                }}>
                  {u.role}
                </span>
              </td>
              <td>
                <select 
                  onChange={(e) => changeRole(u.userId, e.target.value)}
                  value={u.role}
                  style={{ padding: '5px', borderRadius: '5px' }}
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
  );
};

export default AdminPanel;