import { useState, useEffect } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';
import '../styles/Schedule.css';

const Dashboard = () => {
  const [urgentLabs, setUrgentLabs] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [tomorrowSchedule, setTomorrowSchedule] = useState<any[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  
  const [announcement, setAnnouncement] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  
  const user = getUserData();
  const userId = user?.userId;
  const userGroup = user?.group || ''; 

  // --- ЗАГРУЗКА ДАННЫХ ИЗ API ---

  const fetchAnnouncement = async () => {
    if (!userGroup) return;
    try {
      const res = await api.get(`/announcements/${userGroup}`);
      const data = res.data;

      // ПРОВЕРКА: data.active !== false
      if (data && data.content && data.active !== false && !data.content.includes("Объявлений пока нет")) {
        const updatedDate = new Date(data.updatedAt || new Date());
        const now = new Date();
        const diffTime = now.getTime() - updatedDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays <= 3) {
          setAnnouncement(data); 
        } else {
          setAnnouncement(null); 
        }
      } else {
        setAnnouncement(null);
      }
    } catch (error) {
      console.error("Ошибка загрузки объявления:", error);
      setAnnouncement(null);
    }
  };

  const fetchUrgent = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/labs/dashboard?userId=${userId}`);
      const top4 = res.data
        .filter((l: any) => (l.status || l.currentStatus) !== 'PROTECTED')
        .sort((a: any, b: any) => (b.priorityScore || 0) - (a.priorityScore || 0))
        .slice(0, 4);
      setUrgentLabs(top4);
    } catch (error) {
      console.error("Ошибка загрузки фокуса:", error);
    }
  };

  const fetchSchedule = async () => {
    if (!userGroup) return;
    setIsScheduleLoading(true);
    try {
      const response = await fetch(`https://iis.bsuir.by/api/v1/schedule?studentGroup=${userGroup}`);
      const data = await response.json();

      const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
      const today = new Date();
      
      const todayIdx = today.getDay();
      const tomorrowIdx = (todayIdx + 1) % 7; 

      const todayStr = daysMap[todayIdx];
      const tomorrowStr = daysMap[tomorrowIdx];

      const allSchedules = data.schedules || {};
      setTodaySchedule(allSchedules[todayStr] || []);
      setTomorrowSchedule(allSchedules[tomorrowStr] || []);
      
    } catch (error) {
      console.error("Ошибка загрузки расписания БГУИР", error);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  useEffect(() => { 
    fetchUrgent(); 
    fetchSchedule(); 
    fetchAnnouncement(); 
  }, [userId, userGroup]);

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---

  const handleSaveAnnouncement = async () => {
    try {
      const res = await api.put(`/announcements/${userGroup}`, { content: newContent });
      setAnnouncement(res.data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка при обновлении объявления:", error);
      alert("Не удалось сохранить объявление");
    }
  };

  const handleHideAnnouncement = async () => {
    if (window.confirm("Убрать это объявление для всей группы?")) {
      try {
        await api.patch(`/announcements/${userGroup}/hide`);
        setAnnouncement(null); // Убираем с экрана моментально
      } catch (error) {
        alert("Не удалось скрыть объявление");
      }
    }
  };

  const handleStatusToggle = async (labId: number) => {
    try {
      const res = await api.patch(`/labs/${labId}/toggle-status?userId=${userId}`);
      setUrgentLabs(prev => prev.map(l => l.labId === labId ? res.data : l));
    } catch (error) { alert("Не удалось обновить статус"); }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Удалить задачу прямо из фокуса?")) {
      try {
        await api.delete(`/labs/${id}`);
        fetchUrgent();
      } catch (error) { alert("Ошибка при удалении"); }
    }
  };

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusTheme = (status: string) => {
    const themes: Record<string, any> = {
      'RECEIVED':  { bg: 'var(--status-received-bg)',  btn: 'var(--status-received-dark)' },
      'CODED':     { bg: 'var(--status-coded-bg)',     btn: 'var(--status-coded-dark)' },
      'READY':     { bg: 'var(--status-ready-bg)',     btn: 'var(--status-ready-dark)' },
      'SUBMITTED': { bg: 'var(--status-submitted-bg)', btn: 'var(--status-submitted-dark)' },
      'PROTECTED': { bg: 'var(--status-protected-bg)', btn: 'var(--status-protected-dark)' },
    };
    return themes[status] || { bg: '#fff', btn: '#333' };
  };

  const getStatus = (lab: any) => lab.status || lab.currentStatus;

  const formatEmployee = (employee: any) => {
    if (!employee) return '';
    return `${employee.lastName} ${employee.firstName?.[0] || ''}.${employee.middleName?.[0] || ''}.`;
  };

  const renderScheduleColumn = (title: string, lessons: any[]) => (
    <div className="schedule-day">
      <h2>{title}</h2>
      {isScheduleLoading ? (
        <div className="empty-schedule">⏳ Загружаем пары...</div>
      ) : lessons.length === 0 ? (
        <div className="empty-schedule">Пар нет, можно отдыхать! ☕</div>
      ) : (
        lessons.map((lesson: any, index: number) => (
          <div key={index} className={`lesson-card lesson-type-${lesson.lessonTypeAbbrev}`}>
            <div className="lesson-header">
              <span className="lesson-time">{lesson.startLessonTime} - {lesson.endLessonTime}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {lesson.numSubgroup !== 0 && (
                  <span className="lesson-badge" style={{ background: '#e2e8f0' }}>{lesson.numSubgroup} подгр.</span>
                )}
                <span className="lesson-badge">{lesson.lessonTypeAbbrev}</span>
              </div>
            </div>
            <div className="lesson-subject">
              {lesson.subject}
              {lesson.note && <span style={{ fontSize: '12px', color: 'var(--text-gray)', marginLeft: '8px', fontWeight: 'normal' }}>({lesson.note})</span>}
            </div>
            <div className="lesson-details">
              <span>Ауд: <strong>{lesson.auditories?.join(', ') || '-'}</strong></span>
              <span>{lesson.employees?.map(formatEmployee).join(', ') || 'Преподаватель не указан'}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* --- БЛОК ОБЪЯВЛЕНИЯ ОТ СТАРОСТЫ (Отображается ТОЛЬКО если оно есть) --- */}
      {announcement && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 25px', 
          borderRadius: '24px', 
          marginBottom: '35px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 10px 30px rgba(118, 75, 162, 0.2)',
          color: 'white'
        }}>
          <div style={{ fontSize: '30px', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px', lineHeight: 1 }}>
            📢
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '5px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                Сообщение от старосты
              </h3>
              <span style={{ fontSize: '0.8rem', opacity: 0.7, background: 'rgba(0,0,0,0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                {formatDateTime(announcement.updatedAt)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.95 }}>
              {announcement.content}
            </p>
          </div>
          
          {user?.role === 'GROUP_LEADER' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  setNewContent(announcement.content);
                  setIsModalOpen(true);
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', 
                  color: 'white', padding: '8px 15px', borderRadius: '12px', 
                  cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' 
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ✏️ Редактировать
              </button>
              
              <button 
                onClick={handleHideAnnouncement}
                style={{ 
                  background: 'rgba(255, 0, 0, 0.15)', border: '1px solid rgba(255, 100, 100, 0.4)', 
                  color: '#fca5a5', padding: '8px 15px', borderRadius: '12px', 
                  cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' 
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.3)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.15)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
              >
                ✖ Скрыть
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- СЕКЦИЯ 1: ФОКУС (ЛАБЫ) + КНОПКА СОЗДАНИЯ ОБЪЯВЛЕНИЯ --- */}
      <div style={{ 
        marginBottom: '40px', 
        display: 'flex', 
        justifyContent: 'space-between', // Разносит элементы по краям
        alignItems: 'center', // Выравнивает их по вертикали
        flexWrap: 'wrap', 
        gap: '20px' 
      }}>
        <div>
          <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Фокус на сегодня 🎯</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
            Привет, {(user as any)?.firstName || 'студент'}! Вот твои самые приоритетные задачи.
          </p>
        </div>

        {/* Кнопка перенесена сюда и будет видна только если объявления НЕТ */}
        {!announcement && user?.role === 'GROUP_LEADER' && (
          <button 
            onClick={() => {
              setNewContent("");
              setIsModalOpen(true);
            }}
            style={{ 
              background: 'var(--color-purple)', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', 
              fontWeight: 'bold', boxShadow: '0 4px 15px rgba(167, 118, 147, 0.3)' 
            }}
          >
            + Создать объявление
          </button>
        )}
      </div>
      
      

      {/* --- СЕКЦИЯ 1: ФОКУС (ЛАБЫ) --- */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Фокус на сегодня 🎯</h1>
        <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
          Привет, {(user as any)?.firstName || 'студент'}! Вот твои самые приоритетные задачи.
        </p>
      </div>
      
      <div className="dashboard-grid">
        {urgentLabs.length > 0 ? (
          urgentLabs.map(lab => {
            const theme = getStatusTheme(getStatus(lab));
            const isHighPriority = (lab.priorityScore || 0) > 7;

            return (
              <div key={lab.labId} className="lab-card" style={{ 
                background: theme.bg, 
                borderLeft: `8px solid ${isHighPriority ? 'var(--error-red)' : theme.btn}`,
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: '800' }}>
                    {lab.subjectTitle}
                  </span>
                  <button onClick={() => handleDelete(lab.labId)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.3 }}>
                    🗑️
                  </button>
                </div>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-blue)', fontSize: '1.2rem' }}>
                  {lab.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button className="status-badge" onClick={() => handleStatusToggle(lab.labId)} style={{ background: theme.btn, color: 'white', border: 'none' }}>
                    {getStatus(lab)}
                  </button>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: isHighPriority ? 'var(--error-red)' : 'inherit' }}>
                    P: {lab.priorityScore?.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px' }}>
             <p style={{ color: 'var(--text-gray)' }}>Все задачи под контролем! Можно отдохнуть ☕</p>
          </div>
        )}
      </div>

      {/* --- СЕКЦИЯ 2: РАСПИСАНИЕ БГУИР --- */}
      {userGroup && (
        <div className="schedule-section">
          <h1 style={{ color: 'var(--primary-blue)', margin: '0 0 5px 0' }}>Расписание ({userGroup}) 🗓️</h1>
          <p style={{ color: 'var(--text-gray)', marginBottom: '25px' }}>Твои пары на сегодня и завтра.</p>
          
          <div className="schedule-grid">
            {renderScheduleColumn('Сегодня', todaySchedule)}
            {renderScheduleColumn('Завтра', tomorrowSchedule)}
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ОБЪЯВЛЕНИЯ --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '24px',
            width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, color: 'var(--color-primary-blue)' }}>Объявление группы</h2>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
              Это сообщение увидят все студенты группы <strong>{userGroup}</strong> в течение 3 дней.
            </p>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              style={{
                width: '100%', height: '120px', borderRadius: '15px',
                border: '1px solid #e2e8f0', padding: '15px', marginTop: '10px',
                fontFamily: 'inherit', fontSize: '1rem', resize: 'none'
              }}
              placeholder="Введите текст сообщения..."
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={handleSaveAnnouncement}
                style={{ 
                  flex: 1, background: 'var(--color-primary-blue)', color: 'white',
                  border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Сохранить
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ 
                  flex: 1, background: '#f1f5f9', color: 'var(--text-gray)',
                  border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;