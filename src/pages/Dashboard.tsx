import { useState, useEffect } from 'react';
import api from '../api';

const Dashboard = () => {
  const [urgentLabs, setUrgentLabs] = useState<any[]>([]);

  const fetchUrgent = async () => {
    const res = await api.get('/labs/dashboard?userId=1');
    const top4 = res.data
      .filter((l: any) => l.status !== 'PROTECTED')
      .sort((a: any, b: any) => b.priorityScore - a.priorityScore)
      .slice(0, 4);
    setUrgentLabs(top4);
  };

  useEffect(() => { fetchUrgent(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Удалить задачу прямо из фокуса?")) {
      await api.delete(`/labs/${id}`);
      fetchUrgent();
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--primary-blue)', marginBottom: '10px' }}>Фокус на сегодня 🎯</h1>
      <p style={{ color: 'var(--text-gray)', marginBottom: '40px' }}>Ближайшие задачи, требующие внимания</p>
      
      <div className="dashboard-grid">
        {urgentLabs.map(lab => (
          <div key={lab.labId} className="lab-card" style={{ 
            background: 'white', 
            borderLeft: `8px solid ${lab.priorityScore > 7 ? 'var(--error-red)' : 'var(--accent-blue)'}`,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 'bold' }}>{lab.subjectTitle}</span>
              <button onClick={() => handleDelete(lab.labId)} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.3 }}>🗑️</button>
            </div>
            <h3 style={{ margin: '15px 0', color: 'var(--primary-blue)' }}>{lab.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>P: {lab.priorityScore.toFixed(1)}</span>
              <span style={{ fontSize: '12px', background: '#f0f2f5', padding: '4px 8px', borderRadius: '6px' }}>{lab.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;