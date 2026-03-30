import { useState, useEffect } from 'react';
import api from '../api';
import Modal from '../components/Modal';

const Labs = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Состояния формы
  const [editingLabId, setEditingLabId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [complexity, setComplexity] = useState(3);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchData = async () => {
    try {
      const labRes = await api.get('/labs/dashboard?userId=1');
      setLabs(labRes.data);
      const subRes = await api.get('/subjects/group/314302');
      setSubjects(subRes.data);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Функция смены статуса (твоя рабочая версия)
  const handleStatusToggle = async (labId: number) => {
    try {
      const res = await api.patch(`/labs/${labId}/toggle-status?userId=1`);
      // Используем твой метод обновления стейта, который работал
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
    setSelectedSubject(lab.subjectId || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, complexity, deadline, subjectId: selectedSubject, userId: 1 };
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

  // ФИЛЬТРАЦИЯ (используем проверку на оба варианта имени поля, чтобы наверняка)
  const getStatus = (lab: any) => lab.status || lab.currentStatus;

  const activeLabs = labs
    .filter(l => getStatus(l) !== 'PROTECTED')
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  const doneLabs = labs.filter(l => getStatus(l) === 'PROTECTED');

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-blue)', margin: 0 }}>Менеджер задач 📚</h1>
          <p style={{ color: 'var(--text-gray)', margin: '5px 0 0 0' }}>Александра Лаптева | Группа 314302</p>
        </div>
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>+ Добавить лабу</button>
      </div>

      {/* АКТИВНЫЕ ЛАБЫ */}
      <div className="dashboard-grid">
        {activeLabs.map(lab => {
          const theme = getStatusTheme(getStatus(lab));
          return (
            <div key={lab.labId} className="lab-card" style={{ 
              background: theme.bg, 
              borderLeft: `8px solid ${lab.priorityScore > 7 ? 'var(--error-red)' : theme.btn}`,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: '800' }}>{lab.subjectTitle}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={() => handleEditOpen(lab)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5 }}>✏️</button>
                   <button onClick={() => handleDelete(lab.labId)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.5 }}>🗑️</button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary-blue)' }}>{lab.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="status-badge" onClick={() => handleStatusToggle(lab.labId)} style={{ background: theme.btn, color: 'white' }}>
                  {getStatus(lab)}
                </button>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>P: {lab.priorityScore?.toFixed(1)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ГОТОВЫЕ ЛАБЫ */}
      {doneLabs.length > 0 && (
        <div style={{ marginTop: '60px' }}>
          <div className="done-separator"></div>
          <h2 style={{ color: 'var(--text-gray)', fontSize: '18px', marginBottom: '20px' }}>Завершено ✅</h2>
          <div className="dashboard-grid">
            {doneLabs.map(lab => (
              <div key={lab.labId} className="lab-card" style={{ background: 'var(--status-protected-bg)', opacity: 0.7, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px' }}>{lab.subjectTitle}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditOpen(lab)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => handleDelete(lab.labId)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                  </div>
                </div>
                <h3 style={{ margin: 0, textDecoration: 'line-through', color: '#666' }}>{lab.title}</h3>
                <button 
                  className="status-badge" 
                  onClick={() => handleStatusToggle(lab.labId)}
                  style={{ background: 'var(--status-protected-dark)', color: 'white', marginTop: '15px' }}
                >
                  DONE
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* МОДАЛКА */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingLabId ? "Редактировать" : "Новая работа"}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Название" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <select className="form-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required>
              <option value="">Предмет...</option>
              {subjects.map(s => <option key={s.subjectId} value={s.subjectId}>{s.title}</option>)}
            </select>
            <input type="datetime-local" className="form-input" value={deadline} onChange={e => setDeadline(e.target.value)} required />
          </div>
          <div>
            <label>Сложность: {complexity}</label>
            <input type="range" min="1" max="5" value={complexity} onChange={e => setComplexity(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          <button type="submit" className="add-btn" style={{ width: '100%' }}>
            {editingLabId ? "Сохранить изменения" : "Добавить в план"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Labs;