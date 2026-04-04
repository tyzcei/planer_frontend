import { useState } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';

const Profile = () => {
  const user = getUserData();
  
  // Состояния для текстовых данных
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  
  // Состояния для пароля
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  
  // Состояние уведомлений
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Сохранение имени и фамилии
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    try {
      await api.put(`/users/${user.userId}/update-info`, { firstName, lastName });
      setMessage({ type: 'success', text: '✅ Данные профиля обновлены!' });
      
      // Опционально: если ты хранишь имя в localStorage для отображения в сайдбаре, 
      // тут стоит обновить эти данные.
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Не удалось обновить данные' });
    }
  };

  // 2. Смена пароля
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 4) {
      setMessage({ type: 'error', text: '❌ Пароль должен быть не менее 4 символов' });
      return;
    }

    try {
      await api.put(`/users/${user.userId}/change-password`, { newPassword });
      setMessage({ type: 'success', text: '🔑 Пароль успешно изменен!' });
      setNewPassword('');
      setShowPasswordField(false);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Ошибка при смене пароля' });
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: 'var(--color-primary-blue)', marginBottom: '30px' }}>Личный кабинет 👤</h1>

      <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        {/* Карточка пользователя */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
          <div style={{ 
            width: '60px', height: '60px', 
            background: 'var(--grad-sidebar)', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '22px', color: 'white', fontWeight: 'bold' 
          }}>
            {firstName[0]}{lastName[0]}
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--color-dark-navy)' }}>{user?.email}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>
              Группа: <strong>{user?.group}</strong> | Роль: {user?.role}
            </span>
          </div>
        </div>

        {/* Форма редактирования данных */}
        <form onSubmit={handleUpdateInfo} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '5px', display: 'block' }}>Имя</label>
              <input 
                className="form-input" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                style={{ width: '100%' }}
                placeholder="Иван"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '5px', display: 'block' }}>Фамилия</label>
              <input 
                className="form-input" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                style={{ width: '100%' }}
                placeholder="Иванов"
              />
            </div>
          </div>

          <button type="submit" className="add-btn" style={{ width: '100%', padding: '12px' }}>
            Сохранить изменения
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />

        {/* Секция смены пароля */}
        <div style={{ textAlign: 'center' }}>
          {!showPasswordField ? (
            <button 
              onClick={() => setShowPasswordField(true)}
              style={{ 
                background: 'none', border: '1px solid #cbd5e1', 
                padding: '10px 20px', borderRadius: '12px', 
                cursor: 'pointer', color: 'var(--text-gray)',
                fontWeight: '600', transition: '0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-purple)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              🔒 Сменить пароль
            </button>
          ) : (
            <div className="fade-in" style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginBottom: '5px', display: 'block' }}>Новый пароль</label>
              <input 
                type="password"
                className="form-input" 
                placeholder="Минимум 4 символа"
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                style={{ width: '100%', marginBottom: '15px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleChangePassword} 
                  className="add-btn" 
                  style={{ flex: 1, background: '#22c55e' }}
                >
                  Подтвердить
                </button>
                <button 
                  onClick={() => { setShowPasswordField(false); setNewPassword(''); }} 
                  className="add-btn" 
                  style={{ flex: 1, background: '#94a3b8' }}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Уведомления */}
        {message.text && (
          <div style={{ 
            marginTop: '20px', textAlign: 'center', padding: '12px', borderRadius: '12px', 
            background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.9rem', fontWeight: '500'
          }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;