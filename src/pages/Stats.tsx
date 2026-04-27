import { useState, useEffect } from 'react';
import api from '../api';
import { getUserData } from '../utils/auth';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area // <-- Новые импорты для графика дедлайнов
} from 'recharts';

const THEME_COLORS = ['#3b82f6', '#ec4899', '#60a5fa', '#f472b6', '#2563eb', '#db2777'];
const PROGRESS_COLORS = ['#ec4899', '#e2e8f0'];

const Stats = () => {
  const [stats, setStats] = useState<any>(null);
  const [isChartsReady, setIsChartsReady] = useState(false);

  useEffect(() => {
    const currentUser = getUserData(); 
    if (!currentUser) return;

    api.get(`/labs/stats?userId=${currentUser.userId}`)
      .then(res => {
        setStats(res.data);
        setTimeout(() => setIsChartsReady(true), 150);
      })
      .catch(err => console.error("Ошибка загрузки статистики", err));
  }, []);

  if (!stats) return <div style={{ padding: '40px', color: 'var(--text-gray)', fontWeight: 'bold' }}>Загрузка аналитики...</div>;

  const completedCount = stats.progressData?.find((d: any) => d.name === 'Защищено')?.value || 0;
  const totalCount = stats.totalLabs || 0;
  const remainingCount = totalCount - completedCount;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="fade-in" style={{ paddingBottom: '40px', overflowX: 'hidden' }}>
      
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ color: 'var(--color-primary-blue)', margin: 0 }}>Аналитика успеваемости 📈</h1>
        <p style={{ color: 'var(--text-gray)', marginTop: '5px' }}>
          Обзор ваших лабораторных работ в этом семестре.
        </p>
      </div>

      {/* ВЕРХНИЕ КАРТОЧКИ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)', color: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📚</div>
          <div style={{ fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Всего лабораторных</div>
          <div style={{ fontSize: '38px', fontWeight: 'bold', marginTop: '5px' }}>{totalCount}</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #ec4899 100%)', color: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(236, 72, 153, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '36px' }}>🚀</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{progressPercentage}%</div>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>Сдано: {completedCount} из {totalCount}</div>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginTop: '20px', overflow: 'hidden' }}>
            <div style={{ width: isChartsReady ? `${progressPercentage}%` : '0%', height: '100%', background: 'white', borderRadius: '4px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', color: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(219, 39, 119, 0.2)' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏳</div>
          <div style={{ fontSize: '14px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Осталось сдать</div>
          <div style={{ fontSize: '38px', fontWeight: 'bold', marginTop: '5px' }}>{remainingCount}</div>
        </div>
      </div>

      {/* ГРАФИКИ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* 1. ГРАФИК ПРОГРЕССА */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', textAlign: 'center', fontSize: '18px' }}>Соотношение работ</h3>
          {isChartsReady && (
            <ResponsiveContainer width="99%" height={250}>
              <PieChart>
                <Pie data={stats.progressData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} dataKey="value" stroke="none" paddingAngle={5} isAnimationActive={false}>
                  {stats.progressData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PROGRESS_COLORS[index % PROGRESS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} лаб`, 'Количество']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. НАГРУЗКА ПО ПРЕДМЕТАМ */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', textAlign: 'center', fontSize: '18px' }}>Нагрузка по предметам</h3>
          {isChartsReady && (
            <ResponsiveContainer width="99%" height={250}>
              <BarChart data={stats.subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 3. СТАТУСЫ ЛАБ */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', textAlign: 'center', fontSize: '18px' }}>Детализация статусов</h3>
          {isChartsReady && (
            <ResponsiveContainer width="99%" height={250}>
              <PieChart>
                <Pie data={stats.statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="none" label={({name, percent}) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} isAnimationActive={false}>
                  {stats.statusData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 4. СЛОЖНОСТЬ */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', textAlign: 'center', fontSize: '18px' }}>Распределение сложности</h3>
          {isChartsReady && (
            <ResponsiveContainer width="99%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius={85} data={stats.complexityData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="сложность" tick={{fill: '#64748b', fontSize: 13, fontWeight: 'bold'}} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false}/>
                <Radar name="Количество работ" dataKey="количество" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} isAnimationActive={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 5. НОВОЕ: ГОРЯЩИЕ ДЕДЛАЙНЫ (Area Chart с градиентом) */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', textAlign: 'center', fontSize: '18px' }}>Горящие дедлайны</h3>
          {isChartsReady && (
            <ResponsiveContainer width="99%" height={250}>
              <AreaChart data={stats.deadlineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                <Area type="monotone" dataKey="count" name="Сдать лаб" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 6. НОВОЕ: ФОРМА ОТЧЕТНОСТИ (Donut Chart) */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-dark-navy)', textAlign: 'center', fontSize: '18px' }}>Форма отчетности предмета</h3>
          {isChartsReady && (
            <ResponsiveContainer width="99%" height={250}>
              <PieChart>
                <Pie data={stats.controlTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none" label={({name, percent}) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} isAnimationActive={false}>
                  {stats.controlTypeData.map((_entry: any, index: number) => (
                    // Чередуем ярко-синий и светло-синий
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} лаб`, 'Количество']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
};

export default Stats;