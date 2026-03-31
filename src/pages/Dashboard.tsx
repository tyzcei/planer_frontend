import { useState, useEffect } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';

const Dashboard = () => {
  const [urgentLabs, setUrgentLabs] = useState<any[]>([]);
  
  // Получаем реальные данные пользователя вместо хардкода
  const user = getUserData();
  const userId = user?.userId;

  const fetchUrgent = async () => {
    if (!userId) return; // Если не залогинены, не шлем запрос
    
    try {
      // Используем переменную userId в запросе
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

  useEffect(() => { fetchUrgent(); }, [userId]);

  // Логика смены статуса (как на странице лаб)
  const handleStatusToggle = async (labId: number) => {
    try {
      const res = await api.patch(`/labs/${labId}/toggle-status?userId=${userId}`);
      setUrgentLabs(prev => prev.map(l => l.labId === labId ? res.data : l));
    } catch (error) { 
      alert("Не удалось обновить статус"); 
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Удалить задачу прямо из фокуса?")) {
      try {
        await api.delete(`/labs/${id}`);
        fetchUrgent();
      } catch (error) {
        alert("Ошибка при удалении");
      }
    }
  };

  // Цветовые темы (в точности как в Labs.tsx)
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
    <div className="fade-in">
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
                  <button 
                    onClick={() => handleDelete(lab.labId)} 
                    style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.3 }}
                  >
                    🗑️
                  </button>
                </div>

                <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-blue)', fontSize: '1.2rem' }}>
                  {lab.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    className="status-badge" 
                    onClick={() => handleStatusToggle(lab.labId)} 
                    style={{ background: theme.btn, color: 'white', border: 'none', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer' }}
                  >
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
    </div>
  );
};

export default Dashboard;