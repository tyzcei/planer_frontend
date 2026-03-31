import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import { getUserData } from '../utils/auth';

const Labs = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const user = getUserData();
  const userId = user?.userId;
  const groupNumber = user?.group || '314302';
  const isLeader = user?.role === 'GROUP_LEADER' || user?.role === 'ADMIN';

  // Состояния формы
  const [editingLabId, setEditingLabId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [complexity, setComplexity] = useState(3);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const labRes = await api.get(`/labs/dashboard?userId=${userId}`);
      setLabs(labRes.data);
      const subRes = await api.get(`/subjects/group/${groupNumber}`);
      setSubjects(subRes.data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  const toggleSubject = (subjectId: number) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const handleStatusToggle = async (labId: number) => {
    try {
      const res = await api.patch(`/labs/${labId}/toggle-status?userId=${userId}`);
      setLabs(prev => prev.map(l => l.labId === labId ? res.data : l));
    } catch (error) { 
      alert("Не удалось обновить статус"); 
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Удалить работу?")) {
      try {
        await api.delete(`/labs/${id}`);
        fetchData();
      } catch (error) { alert("Ошибка при удалении"); }
    }
  };

  const handleEditOpen = (lab: any) => {
    setEditingLabId(lab.labId);
    setTitle(lab.title);
    setComplexity(lab.complexity);
    setSelectedSubject(lab.subjectId?.toString() || '');
    if (lab.deadline) setDeadline(lab.deadline.substring(0, 16));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLabId(null);
    setTitle('');
    setComplexity(3);
    setDeadline('');
    setSelectedSubject('');
  };

  // Обычное сохранение (только для себя)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, complexity, deadline, subjectId: selectedSubject, userId };
    try {
      if (editingLabId) {
        await api.put(`/labs/${editingLabId}`, payload);
      } else {
        await api.post('/labs', payload);
      }
      handleCloseModal();
      fetchData();
    } catch (error) { alert("Ошибка сохранения"); }
  };

  // РАССЫЛКА ВСЕЙ ГРУППЕ (для старосты)
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedSubject || !deadline) {
      alert("Сначала заполни все поля!");
      return;
    }

    const payload = { title, complexity, deadline, subjectId: selectedSubject, userId };
    
    if (!window.confirm(`Вы уверены? Лаба "${title}" будет добавлена ВСЕМ студентам группы ${groupNumber}!`)) return;

    try {
      await api.post('/labs/group-broadcast', payload);
      alert("✅ Рассылка завершена успешно!");
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Ошибка рассылки. Проверьте права доступа.");
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

  return (
    <div className="fade-in" style={{ width: '100%', paddingBottom: '50px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Учебный план 📖</h1>
          <p style={{ color: 'var(--text-gray)', margin: '5px 0 0 0' }}>{user?.email} | Группа {groupNumber}</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>+ Новая лаба</button>
      </div>

      {/* SUBJECT SECTIONS (ACCORDION) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {subjects.map(subject => {
          const subjectLabs = labs.filter(l => l.subjectTitle === subject.title);
          const isOpen = expandedSubjects[subject.subjectId];
          const completedCount = subjectLabs.filter(l => getStatus(l) === 'PROTECTED').length;

          return (
            <div key={subject.subjectId} style={{ width: '100%', overflow: 'hidden' }}>
              <div 
                onClick={() => toggleSubject(subject.subjectId)}
                style={{
                  width: '100%', padding: '20px 30px', background: 'white', borderRadius: '15px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: '0.3s',
                  borderLeft: isOpen ? '6px solid var(--primary-blue)' : '6px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '20px' }}>{isOpen ? '📂' : '📁'}</span>
                  <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>{subject.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-gray)', background: '#f0f2f5', padding: '2px 10px', borderRadius: '10px' }}>
                    {subjectLabs.length} работ
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-gray)' }}>
                    Выполнено: <strong>{completedCount}/{subjectLabs.length}</strong>
                  </div>
                  <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ 
                  padding: '25px 0', display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '20px', animation: 'slideDown 0.3s ease-out'
                }}>
                  {subjectLabs.length > 0 ? (
                    subjectLabs.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).map(lab => {
                      const isDone = getStatus(lab) === 'PROTECTED';
                      const theme = getStatusTheme(getStatus(lab));
                      return (
                        <div key={lab.labId} className="lab-card" style={{ 
                          background: isDone ? 'var(--status-protected-bg)' : theme.bg, 
                          opacity: isDone ? 0.7 : 1,
                          borderLeft: `8px solid ${lab.priorityScore > 7 ? 'var(--error-red)' : theme.btn}`,
                          margin: 0
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: '800' }}>{lab.subjectTitle}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                               <button onClick={() => handleEditOpen(lab)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5 }}>✏️</button>
                               <button onClick={() => handleDelete(lab.labId)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5 }}>🗑️</button>
                            </div>
                          </div>
                          <h3 style={{ 
                            margin: '0 0 15px 0', color: 'var(--primary-blue)',
                            textDecoration: isDone ? 'line-through' : 'none' 
                          }}>{lab.title}</h3>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="status-badge" onClick={() => handleStatusToggle(lab.labId)} style={{ background: theme.btn, color: 'white' }}>
                              {getStatus(lab)}
                            </button>
                            {!isDone && <div style={{ fontWeight: 'bold', fontSize: '13px' }}>P: {lab.priorityScore?.toFixed(1)}</div>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-gray)', padding: '20px' }}>
                      В этом разделе пока нет задач ☕
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL WITH BROADCAST OPTION */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLabId ? "Редактировать работу" : "Новая работа"}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Название (например: Лаба №1)" required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <select className="form-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required>
              <option value="">Выбери предмет...</option>
              {subjects.map(s => <option key={s.subjectId} value={s.subjectId}>{s.title}</option>)}
            </select>
            <input type="datetime-local" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Сложность: <strong>{complexity}</strong></label>
            <input type="range" min="1" max="5" value={complexity} onChange={e => setComplexity(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="add-btn" style={{ width: '100%' }}>
              {editingLabId ? "Сохранить изменения" : "Добавить только себе"}
            </button>

            {/* Кнопка рассылки: только при создании и только для админов/старост */}
            {!editingLabId && isLeader && (
              <button 
                type="button" 
                onClick={handleBroadcastSubmit}
                className="add-btn" 
                style={{ width: '100%', background: '#2ecc71', border: 'none', color: 'white', fontWeight: 'bold' }}
              >
                📢 Раздать всей группе {groupNumber}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Labs;