import { useState, useEffect } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';
import '../styles/Schedule.css'; // Тот самый файл со стилями

const Dashboard = () => {
  const [urgentLabs, setUrgentLabs] = useState<any[]>([]);
  
  // Состояния для расписания
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [tomorrowSchedule, setTomorrowSchedule] = useState<any[]>([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  
  const user = getUserData();
  const userId = user?.userId;
  // Берем группу из профиля юзера
  const userGroup = user?.groupNumber || user?.group || ''; 

  // --- ЛАБЫ ---
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

  // --- РАСПИСАНИЕ БГУИР ---
  const fetchSchedule = async () => {
    if (!userGroup) return;
    setIsScheduleLoading(true);
    try {
      const response = await fetch(`https://iis.bsuir.by/api/v1/schedule?studentGroup=${userGroup}`);
      const data = await response.json();

      // Магия определения дней недели
      const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
      const today = new Date();
      
      const todayIdx = today.getDay(); // 0 - Вс, 1 - Пн ...
      const tomorrowIdx = (todayIdx + 1) % 7; 

      const todayStr = daysMap[todayIdx];
      const tomorrowStr = daysMap[tomorrowIdx];

      // Берем расписание на конкретные дни (если пар нет, будет пустой массив)
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
  }, [userId, userGroup]);

  // --- ВЗАИМОДЕЙСТВИЕ С ЛАБАМИ ---
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

  const getStatusTheme = (status: string) => {
    const themes: any = {
      'RECEIVED':  { bg: 'var(--status-received-bg)',  btn: 'var(--status-received-dark)' },
      'CODED':     { bg: 'var(--status-coded-bg)',     btn: 'var(--status-coded-dark)' },
      'READY':     { bg: 'var(--status-ready-bg)',     btn: 'var(--status-ready-dark)' },
      'SUBMITTED': { bg: 'var(--status-submitted-bg)', btn: 'var(--status-submitted-dark)' },
      'PROTECTED': { bg: 'var(--status-protected-bg)', btn: 'var(--status-protected-dark)' },
    };
    return themes[status] || { bg: '#fff', btn: '#333' };
  };

  const getStatus = (lab: any) => lab.status || lab.currentStatus;

  // Форматируем препода: "Владымцев В.Д."
  const formatEmployee = (employee: any) => {
    if (!employee) return '';
    return `${employee.lastName} ${employee.firstName?.[0] || ''}.${employee.middleName?.[0] || ''}.`;
  };

  // --- КОМПОНЕНТ ДЛЯ ОТРИСОВКИ КОЛОНКИ ПАР ---
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
                {/* Выводим номер подгруппы, если он есть */}
                {lesson.numSubgroup !== 0 && (
                  <span className="lesson-badge" style={{ background: '#e2e8f0' }}>{lesson.numSubgroup} подгр.</span>
                )}
                <span className="lesson-badge">{lesson.lessonTypeAbbrev}</span>
              </div>
            </div>
            
            <div className="lesson-subject">
              {lesson.subject}
              {/* Выводим примечание (например "английский"), если оно есть */}
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
      
      {/* СЕКЦИЯ 1: ФОКУС (ЛАБЫ) */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Фокус на сегодня 🎯</h1>
        <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
          Привет, {user?.firstName || 'студент'}! Вот твои самые приоритетные задачи.
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

      {/* СЕКЦИЯ 2: РАСПИСАНИЕ БГУИР */}
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

    </div>
  );
};

export default Dashboard;