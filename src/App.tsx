import { useState } from 'react';
import './styles/theme.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Labs from './pages/Labs';
import AdminPanel from './pages/AdminPanel';
import Register from './pages/Register'; 
import ScheduleWeek from './pages/ScheduleWeek';
import api from './api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
  // Новое состояние: показываем логин или регистрацию?
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- ЛОГИКА ВХОДА ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.accessToken;
      
      if (token) {
        localStorage.setItem('accessToken', token);
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.status === 401 
        ? 'Неверный email или пароль' 
        : 'Сервер недоступен. Проверь работу бэкенда!';
      alert(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  // --- ЭКРАН АВТОРИЗАЦИИ / РЕГИСТРАЦИИ (Если не вошли) ---
  if (!isLoggedIn) {
    // Если пользователь нажал "Зарегистрироваться", показываем компонент Register
    if (!isLoginMode) {
      return (
        <Register 
          onRegisterSuccess={() => setIsLoggedIn(true)} 
          onSwitchToLogin={() => setIsLoginMode(true)} 
        />
      );
    }

    // Иначе показываем форму входа
    return (
      <div className="login-screen" style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', width: '100vw', background: 'var(--color-bg-light)' 
      }}>
        <form onSubmit={handleLogin} className="login-form" style={{ 
          background: 'white', padding: '40px', borderRadius: '30px', 
          textAlign: 'center', width: '100%', maxWidth: '380px', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.05)' 
        }}>
          <h1 style={{ color: 'var(--color-dark-navy)', marginBottom: '10px', fontSize: '26px' }}>
            Semester Passport
          </h1>
          <p style={{ color: 'var(--text-gray)', marginBottom: '30px', fontSize: '14px' }}>
            Студенческий менеджер задач
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="📧 Email" 
              className="form-input"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            
            <input 
              type="password" 
              placeholder="🔒 Пароль" 
              className="form-input"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            
            <button type="submit" className="add-btn" style={{ width: '100%', marginTop: '10px' }}>
              Войти в кабинет
            </button>
          </div>

          {/* Кнопка переключения на регистрацию */}
          <p style={{ marginTop: '25px', color: 'var(--text-gray)', fontSize: '14px' }}>
            Нет аккаунта?{' '}
            <span 
              onClick={() => setIsLoginMode(false)} 
              style={{ color: 'var(--color-purple)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Зарегистрироваться
            </span>
          </p>
        </form>
      </div>
    );
  }

  // --- ГЛАВНЫЙ ИНТЕРФЕЙС (После входа) ---
  return (
    <div className="main-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="content-area">
        
        {/* === ВОТ ЗДЕСЬ ПЕРЕКЛЮЧАЮТСЯ ВКЛАДКИ === */}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'schedule' && <ScheduleWeek />} {/* <--- ДОБАВЛЕНО РАСПИСАНИЕ */}
        {activeTab === 'labs' && <Labs />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'stats' && (
          <div className="lab-card" style={{ background: 'white', padding: '40px' }}>
            <h2 style={{ color: 'var(--color-primary-blue)' }}>Статистика семестра 📈</h2>
            <p style={{ color: 'var(--text-gray)' }}>Здесь скоро появятся графики успеваемости.</p>
          </div>
        )}
        
      </main>
    </div>
  );
}

export default App;