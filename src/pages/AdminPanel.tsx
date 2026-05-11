import { useState, useEffect } from 'react';
import api from '../api';

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  
  const [groupRequests, setGroupRequests] = useState<any[]>([]);
  
  const [syncGroup, setSyncGroup] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [usersRes, groupsRes, requestsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/groups'),
        api.get('/admin/group-requests') 
      ]);
      setUsers(usersRes.data);
      setAvailableGroups(groupsRes.data);
      setGroupRequests(requestsRes.data);
    } catch (e) {
      alert("Доступ запрещен или ошибка сервера");
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const changeRole = async (userId: number, newRole: string) => {
    try { await api.patch(`/admin/users/${userId}/role?newRole=${newRole}`); fetchData(); } 
    catch (e) { alert("Не удалось сменить роль"); }
  };

  const changeGroup = async (userId: number, newGroup: string) => {
    try { await api.patch(`/admin/users/${userId}/group?groupNumber=${newGroup}`); fetchData(); } 
    catch (e) { alert("Не удалось сменить группу"); }
  };

  const toggleBlock = async (userId: number, currentBlockStatus: boolean) => {
    const newStatus = !currentBlockStatus;
    if (!window.confirm(`Вы уверены, что хотите ${newStatus ? "заблокировать" : "разблокировать"} пользователя?`)) return;
    try { await api.patch(`/admin/users/${userId}/block?block=${newStatus}`); fetchData(); } 
    catch (e) { alert("Ошибка при изменении статуса блокировки"); }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm("ВНИМАНИЕ! Вы уверены, что хотите НАВСЕГДА удалить пользователя?")) return;
    try { await api.delete(`/admin/users/${userId}`); fetchData(); } 
    catch (e) { alert("Ошибка при удалении пользователя"); }
  };

  const handleSyncGroup = async () => {
    if (!syncGroup.trim()) { setSyncMessage({ type: 'error', text: 'Сначала введите номер группы!' }); return; }
    setIsSyncing(true); setSyncMessage(null);
    try {
      await api.post(`/teachers/force-sync/${syncGroup}`);
      setSyncMessage({ type: 'success', text: `✅ Преподаватели группы ${syncGroup} обновлены!` });
      setSyncGroup(''); 
      fetchData();
    } catch (error) {
      setSyncMessage({ type: 'error', text: '❌ Ошибка синхронизации.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleProcessRequest = async (requestId: number, approve: boolean) => {
    try {
      await api.patch(`/admin/group-requests/${requestId}?approve=${approve}`);
      fetchData(); 
    } catch (error) {
      alert("Ошибка при обработке заявки");
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      <datalist id="available-groups">
        {availableGroups.map(group => <option key={group} value={group} />)}
      </datalist>

      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Панель Администратора ⚙️</h1>
        <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
          Управление доступом и системными процессами Semester Passport.
        </p>
      </div>

      {/* СИНЕ-РОЗОВЫЙ БЛОК: Входящие заявки на добавление в группу */}
      {groupRequests.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)', padding: '25px', borderRadius: '20px', marginBottom: '30px', color: 'white', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.2)' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>🔔 Новые заявки в группы ({groupRequests.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {groupRequests.map(req => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{req.fullName} <span style={{ opacity: 0.8, fontWeight: 'normal', fontSize: '14px' }}>({req.email})</span></div>
                  <div style={{ fontSize: '14px', marginTop: '4px' }}>Хочет вступить в группу: <strong style={{ background: 'white', color: '#ec4899', padding: '2px 8px', borderRadius: '6px' }}>{req.requestedGroup}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleProcessRequest(req.id, true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>✅ Принять</button>
                  <button onClick={() => handleProcessRequest(req.id, false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>❌ Отклонить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: 'white', padding: '25px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-dark-navy)' }}>🔄 Интеграция расписания (БГУИР)</h3>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '15px' }}>Введите номер группы (например, 314302), чтобы принудительно подтянуть или обновить список её преподавателей из API БГУИР.</p>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" list="available-groups" placeholder="Номер группы..." value={syncGroup} onChange={(e) => setSyncGroup(e.target.value)} style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', width: '200px', fontSize: '1rem' }} />
          <button onClick={handleSyncGroup} disabled={isSyncing} style={{ background: isSyncing ? '#cbd5e1' : 'var(--color-purple)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
            {isSyncing ? '⏳ Загрузка...' : 'Обновить преподавателей'}
          </button>
          {syncMessage && <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: syncMessage.type === 'success' ? '#166534' : '#991b1b', background: syncMessage.type === 'success' ? '#dcfce7' : '#fee2e2', padding: '8px 12px', borderRadius: '8px' }}>{syncMessage.text}</span>}
        </div>
      </div>

      <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--color-dark-navy)' }}>🛡️ Пользователи системы</h3>
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
                <tr key={u.userId} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s', background: u.blocked ? '#fff1f2' : 'transparent', opacity: u.blocked ? 0.7 : 1 }} onMouseOver={(e) => {if(!u.blocked) e.currentTarget.style.background = '#f8fafc'}} onMouseOut={(e) => {if(!u.blocked) e.currentTarget.style.background = 'transparent'}}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600', color: u.blocked ? '#e11d48' : 'var(--color-dark-navy)' }}>{u.email} {u.blocked && '🚫 (Заблокирован)'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{u.firstName} {u.lastName}</div>
                  </td>
                  <td>
                    <input list="available-groups" defaultValue={u.groupNumber || ''} onBlur={(e) => { if(e.target.value !== u.groupNumber) changeGroup(u.userId, e.target.value); }} placeholder="Нет группы" style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '120px', outline: 'none' }} />
                  </td>
                  <td>
                    <select onChange={(e) => changeRole(u.userId, e.target.value)} value={u.role} disabled={u.blocked} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: 'var(--color-dark-navy)', cursor: u.blocked ? 'not-allowed' : 'pointer', outline: 'none' }}>
                      <option value="STUDENT">Студент</option>
                      <option value="GROUP_LEADER">Староста</option>
                      <option value="ADMIN">Админ</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => toggleBlock(u.userId, u.blocked)} title={u.blocked ? "Разблокировать" : "Заблокировать"} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', filter: u.blocked ? 'grayscale(0%)' : 'grayscale(100%)' }}>
                        {u.blocked ? '✅' : '🚫'}
                      </button>
                      <button onClick={() => deleteUser(u.userId)} title="Удалить навсегда" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>🗑️</button>
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