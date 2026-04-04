import { useState, useEffect } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';

interface Teacher {
  bsuirUrlId: string;
  teacherName: string;
  subjectTitle: string;
  lessonType: string;
  photoLink: string | null;
  noteText: string | null;
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  const user = getUserData();
  const userGroup = user?.group || '';
  const isGroupLeader = user?.role === 'GROUP_LEADER';

  const fetchTeachers = async () => {
    if (!userGroup) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/teachers/${userGroup}`);
      setTeachers(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке преподавателей:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [userGroup]);

  const handleSaveNote = async (bsuirUrlId: string) => {
    try {
      await api.put(`/teachers/${userGroup}/${bsuirUrlId}/note`, { noteText: editNoteText });
      
      setTeachers(prev => prev.map(t => 
        t.bsuirUrlId === bsuirUrlId ? { ...t, noteText: editNoteText } : t
      ));
      setEditingId(null);
    } catch (error) {
      alert("Не удалось сохранить заметку");
      console.error(error);
    }
  };

  const getBadgeColor = (type: string) => {
    if (type.includes('ЛК')) return { bg: '#dcfce7', text: '#166534' }; 
    if (type.includes('ПЗ') || type.includes('ЛР')) return { bg: '#f3e8ff', text: '#6b21a8' }; 
    return { bg: '#f1f5f9', text: '#475569' };
  };

  const groupedTeachers = teachers.reduce((acc, teacher) => {
    if (!acc[teacher.subjectTitle]) {
      acc[teacher.subjectTitle] = [];
    }
    acc[teacher.subjectTitle].push(teacher);
    return acc;
  }, {} as Record<string, Teacher[]>);

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--color-primary-blue)', margin: 0 }}>Преподаватели 👨‍🏫</h1>
        <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
          Список преподавателей группы {userGroup} и важные заметки к ним.
        </p>
      </div>

      {isLoading ? (
        <p>Загрузка данных из расписания...</p>
      ) : teachers.length === 0 ? (
        <div style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', color: 'var(--text-gray)' }}>
          Преподаватели пока не загружены. Обновите данные в панели администратора.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {Object.entries(groupedTeachers).map(([subjectTitle, subjectTeachers]) => (
            <div key={subjectTitle} style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              
              <h2 style={{ 
                margin: '0 0 15px 0', color: 'var(--color-dark-navy)', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                📚 {subjectTitle}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {subjectTeachers
                  .sort((a, b) => a.lessonType.localeCompare(b.lessonType))
                  .map(teacher => {
                    const isLecturer = teacher.lessonType.includes('ЛК');
                    const stripeColor = isLecturer ? '#22c55e' : '#a855f7'; 
                    const badge = getBadgeColor(teacher.lessonType);
                    
                    // ЛОГИКА ОТОБРАЖЕНИЯ ЗАМЕТКИ
                    const hasNote = Boolean(teacher.noteText && teacher.noteText.trim() !== "");
                    const isEditing = editingId === teacher.bsuirUrlId;
                    const showNotesBlock = hasNote || isEditing;
                    
                    return (
                      <div key={`${teacher.bsuirUrlId}-${teacher.subjectTitle}`} className="fade-in" style={{ 
                        background: 'white', borderRadius: '16px', padding: '15px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
                        display: 'flex', flexWrap: 'wrap', alignItems: showNotesBlock ? 'stretch' : 'center', gap: '20px', 
                        borderLeft: `5px solid ${stripeColor}`,
                        transition: 'all 0.3s ease'
                      }}>
                        
                        {/* ЛЕВАЯ ЧАСТЬ: Фото и Имя */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: showNotesBlock ? '1 1 250px' : '1 1 100%', minWidth: '250px' }}>
                          <img 
                            src={teacher.photoLink || 'https://via.placeholder.com/50?text=👤'} 
                            alt={teacher.teacherName}
                            style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50?text=👤'; }}
                          />
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', color: 'var(--color-dark-navy)', fontSize: '1.05rem' }}>
                              {teacher.teacherName}
                            </h3>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.75rem', background: badge.bg, color: badge.text, padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                                {teacher.lessonType}
                              </span>
                              
                              {/* Кнопка создания заметки (видна только старосте, если заметки НЕТ) */}
                              {!showNotesBlock && isGroupLeader && (
                                <button 
                                  onClick={() => {
                                    setEditingId(teacher.bsuirUrlId);
                                    setEditNoteText("");
                                  }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: stripeColor, fontWeight: 'bold', padding: 0 }}
                                >
                                  + Добавить заметку
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ПРАВАЯ ЧАСТЬ: БЛОК ЗАМЕТОК (скрывается, если пусто) */}
                        {showNotesBlock && (
                          <div className="fade-in" style={{ 
                            background: '#f1f5f9', borderRadius: '12px', padding: '12px 15px', 
                            flex: '3 1 400px', 
                            border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditing ? '8px' : '4px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-gray)' }}>
                                📝 Заметки:
                              </span>
                              
                              {/* Кнопка редактирования */}
                              {isGroupLeader && !isEditing && (
                                <button 
                                  onClick={() => {
                                    setEditingId(teacher.bsuirUrlId);
                                    setEditNoteText(teacher.noteText || "");
                                  }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-primary-blue)', fontWeight: 'bold', padding: 0 }}
                                >
                                  ✏️ Изменить
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div>
                                <textarea
                                  value={editNoteText}
                                  onChange={(e) => setEditNoteText(e.target.value)}
                                  placeholder="Инсайды по преподавателю..."
                                  style={{
                                    width: '100%', height: '60px', borderRadius: '8px', padding: '8px',
                                    border: `2px solid ${stripeColor}`, outline: 'none', resize: 'none',
                                    fontFamily: 'inherit', fontSize: '0.85rem', marginBottom: '8px'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button 
                                    onClick={() => handleSaveNote(teacher.bsuirUrlId)}
                                    style={{ flex: 1, background: stripeColor, color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                  >
                                    Сохранить
                                  </button>
                                  <button 
                                    onClick={() => setEditingId(null)}
                                    style={{ flex: 1, background: '#e2e8f0', color: 'var(--text-gray)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-dark-navy)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                {teacher.noteText}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Teachers;