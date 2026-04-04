import { useState, useEffect } from 'react';
import { getUserData } from '../utils/auth';
import '../styles/Schedule.css';

const ScheduleWeek = () => {
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeSubgroup, setActiveSubgroup] = useState<'all' | 1 | 2>('all');
  const [selectedWeek, setSelectedWeek] = useState<number>(1); 
  
  // Сохраняем текущее время при загрузке, чтобы определять идущую пару
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = getUserData();
  const userGroup = user?.group || '';

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!userGroup) return;
      setIsLoading(true);
      try {
        // Делаем сразу ДВА запроса: за расписанием и за текущей неделей
        const [scheduleRes, weekRes] = await Promise.all([
          fetch(`https://iis.bsuir.by/api/v1/schedule?studentGroup=${userGroup}`),
          fetch(`https://iis.bsuir.by/api/v1/schedule/current-week`)
        ]);
        
        const data = await scheduleRes.json();
        const currentWeekNum = await weekRes.json(); // Придет число от 1 до 4
        
        setWeeklySchedule(data.schedules || {});
        // Автоматически переключаем интерфейс на текущую неделю!
        if (typeof currentWeekNum === 'number') {
          setSelectedWeek(currentWeekNum);
        }
      } catch (error) {
        console.error("Ошибка загрузки расписания БГУИР", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScheduleData();

    // Обновляем часы каждую минуту, чтобы пара подсвечивалась в реальном времени
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [userGroup]);

  const daysOrder = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

  const formatEmployee = (employee: any) => {
    if (!employee) return '';
    return `${employee.lastName} ${employee.firstName?.[0] || ''}.${employee.middleName?.[0] || ''}.`;
  };

  const getButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.2s',
    background: isActive ? 'var(--color-purple)' : 'white',
    color: isActive ? 'white' : 'var(--text-gray)',
    boxShadow: isActive ? '0 4px 15px rgba(167, 118, 147, 0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
  });

  const getLessonColor = (type: string) => {
    if (type === 'ЛК') return '#2ecc71'; // Зеленый
    if (type === 'ПЗ') return '#9b59b6'; // Фиолетовый
    if (type === 'ЛР' || type === 'ЛБ') return '#e67e22'; // Оранжевый
    return 'var(--color-purple)'; 
  };

  // --- ЛОГИКА ОПРЕДЕЛЕНИЯ ТЕКУЩЕЙ ПАРЫ ---
  const checkIsCurrentLesson = (dayName: string, start: string, end: string) => {
    const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const todayName = daysMap[currentTime.getDay()];
    
    // Если сегодня другой день недели, пара точно не идет
    if (dayName !== todayName) return false;

    // Переводим часы и минуты в минуты от начала дня
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const [sh, sm] = start.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    
    const [eh, em] = end.split(':').map(Number);
    const endMinutes = eh * 60 + em;
    
    // Идет ли пара прямо сейчас?
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const activeDays = daysOrder.filter(dayName => {
    const rawLessons = weeklySchedule[dayName] || [];
    const lessons = rawLessons.filter((lesson: any) => {
      const weekMatch = lesson.weekNumber?.includes(selectedWeek);
      const subgroupMatch = activeSubgroup === 'all' || lesson.numSubgroup === 0 || lesson.numSubgroup === activeSubgroup;
      return weekMatch && subgroupMatch;
    });
    return lessons.length > 0;
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary-blue)', margin: 0 }}>Расписание на неделю 🗓️</h1>
          <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
            Группа {userGroup} | Расписание БГУИР
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '5px', borderRadius: '16px' }}>
            {[1, 2, 3, 4].map(w => (
              <button key={w} style={getButtonStyle(selectedWeek === w)} onClick={() => setSelectedWeek(w)}>
                {w} неделя
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '5px', borderRadius: '16px' }}>
            <button style={getButtonStyle(activeSubgroup === 'all')} onClick={() => setActiveSubgroup('all')}>
              Вся группа
            </button>
            <button style={getButtonStyle(activeSubgroup === 1)} onClick={() => setActiveSubgroup(1)}>
              1 подгруппа
            </button>
            <button style={getButtonStyle(activeSubgroup === 2)} onClick={() => setActiveSubgroup(2)}>
              2 подгруппа
            </button>
          </div>

        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-gray)' }}>
          <h2>⏳ Загружаем расписание...</h2>
        </div>
      ) : activeDays.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <h2 style={{ color: 'var(--color-primary-blue)', margin: '0 0 10px 0' }}>Пар нет! 🎉</h2>
          <p style={{ color: 'var(--text-gray)' }}>
            На {selectedWeek}-й неделе для выбранной подгруппы занятий не найдено. Можно смело отдыхать.
          </p>
        </div>
      ) : (
        <div className="weekly-grid">
          {activeDays.map(dayName => {
            const rawLessons = weeklySchedule[dayName] || [];
            
            const lessons = rawLessons.filter((lesson: any) => {
              const weekMatch = lesson.weekNumber?.includes(selectedWeek);
              const subgroupMatch = activeSubgroup === 'all' || lesson.numSubgroup === 0 || lesson.numSubgroup === activeSubgroup;
              return weekMatch && subgroupMatch;
            });

            return (
              <div key={dayName} className="weekly-day">
                <h2>{dayName}</h2>
                {lessons.map((lesson: any, index: number) => {
                  const lessonColor = getLessonColor(lesson.lessonTypeAbbrev);
                  // Проверяем, идет ли эта пара прямо сейчас
                  const isCurrent = checkIsCurrentLesson(dayName, lesson.startLessonTime, lesson.endLessonTime);

                  return (
                    <div 
                      key={index} 
                      className="compact-lesson-card" 
                      style={{ 
                        borderLeftColor: lessonColor,
                        // Если пара идет сейчас, добавляем красивую обводку, тень и чуть-чуть увеличиваем
                        ...(isCurrent ? {
                          boxShadow: `0 0 0 2px ${lessonColor}, 0 8px 20px rgba(0,0,0,0.1)`,
                          transform: 'scale(1.02)',
                          zIndex: 10,
                          position: 'relative'
                        } : {})
                      }}
                    >
                      <div className="lesson-header">
                        <span className="lesson-time">
                          {lesson.startLessonTime} - {lesson.endLessonTime}
                          {/* Красный маркер "Сейчас" */}
                          {isCurrent && <span style={{ color: '#e53e3e', fontSize: '11px', marginLeft: '8px', fontWeight: 'bold' }}>● Сейчас</span>}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {lesson.numSubgroup !== 0 && (
                            <span className="lesson-badge" style={{ background: '#e2e8f0' }}>{lesson.numSubgroup} п.</span>
                          )}
                          <span className="lesson-badge" style={{ color: lessonColor, background: `${lessonColor}15` }}>
                            {lesson.lessonTypeAbbrev}
                          </span>
                        </div>
                      </div>
                      
                      <div className="lesson-subject">
                        {lesson.subject}
                        {lesson.note && <span style={{ fontSize: '11px', color: 'var(--text-gray)', marginLeft: '6px' }}>({lesson.note})</span>}
                      </div>
                      
                      <div className="lesson-details">
                        <span>Ауд: <strong>{lesson.auditories?.join(', ') || '-'}</strong></span>
                        <span>{lesson.employees?.map(formatEmployee).join(', ') || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleWeek;