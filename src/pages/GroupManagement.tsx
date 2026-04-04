import { useState, useEffect } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';

const GroupManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // НОВОЕ: Состояние для строки поиска
  const [searchQuery, setSearchQuery] = useState("");

  const user = getUserData();
  const userGroup = user?.group || '';

  const fetchData = async () => {
    if (!userGroup) return;
    setIsLoading(true);
    try {
      const [studentsRes, notifRes] = await Promise.all([
        api.get(`/group-management/${userGroup}/students`),
        api.get(`/group-management/${userGroup}/notifications`)
      ]);
      setStudents(studentsRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Ошибка при загрузке данных группы:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userGroup]);

  const handleRemoveStudent = async (studentId: number, name: string) => {
    if (window.confirm(`Вы уверены, что хотите исключить ${name} из группы?`)) {
      try {
        await api.delete(`/group-management/students/${studentId}`);
        setStudents(prev => prev.filter(s => s.userId !== studentId));
      } catch (error) {
        alert("Не удалось исключить студента.");
      }
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/group-management/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n 
      ));
    } catch (error) {
      console.error("Ошибка обновления уведомления", error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  if (user?.role !== 'GROUP_LEADER') {
    return <div style={{ padding: '40px', textAlign: 'center' }}>У вас нет доступа к этой странице.</div>;
  }

  const unreadNotifications = notifications.filter(n => n.read === false || n.isRead === false);

  // НОВОЕ: Фильтруем студентов по имени, фамилии или email
  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* ШАПКА СТРАНИЦЫ И КНОПКА ИСТОРИИ */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary-blue)', margin: 0 }}>Управление группой {userGroup} 👥</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
            Здесь вы можете контролировать состав группы и просматривать новые события.
          </p>
        </div>
        <button 
          onClick={() => setIsHistoryOpen(true)}
          style={{ 
            background: 'white', color: 'var(--color-primary-blue)', border: '1px solid #e2e8f0', 
            padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-blue)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          📜 История изменений
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: unreadNotifications.length > 0 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '30px' }}>
        
        {/* === БЛОК: УВЕДОМЛЕНИЯ === */}
        {unreadNotifications.length > 0 && (
          <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', alignSelf: 'start' }}>
            <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Новые события
              <span style={{ background: 'var(--color-error-red)', color: 'white', fontSize: '12px', padding: '2px 8px', borderRadius: '10px' }}>
                {unreadNotifications.length}
              </span>
            </h2>

            {isLoading ? <p>Загрузка...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {unreadNotifications.map(notif => (
                  <div key={notif.id} className="fade-in" style={{ 
                    padding: '15px', borderRadius: '16px', background: '#eff6ff',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--color-dark-navy)' }}>
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{formatDateTime(notif.createdAt)}</span>
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                      >
                        ✓ Скрыть
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === БЛОК: СПИСОК СТУДЕНТОВ === */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          
          {/* НОВОЕ: Заголовок и строка поиска в одну линию (или друг под другом на мобилках) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'var(--color-dark-navy)', fontSize: '1.2rem' }}>
              Состав группы ({students.length})
            </h2>
            
            <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '350px' }}>
              <input 
                type="text" 
                placeholder="Поиск по имени или email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 15px', paddingLeft: '35px',
                  borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none',
                  fontSize: '0.9rem', transition: '0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary-blue)'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                🔍
              </span>
            </div>
          </div>

          {isLoading ? <p>Загрузка...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: unreadNotifications.length > 0 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              
              {/* НОВОЕ: Отрисовываем отфильтрованный список (filteredStudents) */}
              {filteredStudents.length === 0 ? (
                <p style={{ color: 'var(--text-gray)', gridColumn: '1 / -1', textAlign: 'center', padding: '20px 0' }}>
                  Студенты не найдены.
                </p>
              ) : (
                filteredStudents.map(student => (
                  <div key={student.userId} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '15px', border: '1px solid #e2e8f0', borderRadius: '16px' 
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--color-primary-blue)' }}>
                        {student.firstName} {student.lastName}
                        {student.role === 'GROUP_LEADER' && <span style={{ marginLeft: '8px', fontSize: '12px', background: '#fef08a', color: '#854d0e', padding: '2px 6px', borderRadius: '6px' }}>Староста</span>}
                      </h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>{student.email}</span>
                    </div>
                    
                    {student.role !== 'GROUP_LEADER' && (
                      <button 
                        onClick={() => handleRemoveStudent(student.userId, `${student.firstName} ${student.lastName}`)}
                        style={{ 
                          background: '#fee2e2', color: '#ef4444', border: 'none', 
                          padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#fca5a5'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                      >
                        Исключить
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>

      {/* === МОДАЛЬНОЕ ОКНО: ИСТОРИЯ ИЗМЕНЕНИЙ === */}
      {isHistoryOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="fade-in" style={{
            background: 'white', padding: '30px', borderRadius: '24px',
            width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'var(--color-dark-navy)' }}>История группы</h2>
              <button onClick={() => setIsHistoryOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            </div>
            
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--text-gray)', textAlign: 'center', padding: '20px 0' }}>История пока пуста.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {notifications.map(notif => (
                  <div key={notif.id} style={{ 
                    padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0',
                    background: (notif.read || notif.isRead) ? '#f8fafc' : '#eff6ff'
                  }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: (notif.read || notif.isRead) ? 'var(--text-gray)' : 'var(--color-dark-navy)' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupManagement;