import { useState } from 'react';
import './styles/theme.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Labs from './pages/Labs';
import AdminPanel from './pages/AdminPanel'; // Импортируем новую страницу
import api from './api';

function App() {
  // 1. Инициализация состояния авторизации (проверяем наличие токена в хранилище)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
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
        localStorage.setItem('accessToken', token); // Сохраняем токен
        setIsLoggedIn(true);
        console.log("Успешный вход в систему!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.response?.status === 401 
        ? 'Неверный email или пароль' 
        : 'Сервер недоступен. Проверь работу бэкенда!';
      alert(message);
    }
  };

  // --- ЛОГИКА ВЫХОДА ---
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setActiveTab('dashboard'); // Сбрасываем вкладку на главную
  };

  // --- ЭКРАН АВТОРИЗАЦИИ (Если не вошли) ---
  if (!isLoggedIn) {
    return (
      <div className="login-screen" style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', width: '100vw', background: 'var(--primary-blue)' 
      }}>
        <form onSubmit={handleLogin} className="login-form" style={{ 
          background: 'white', padding: '40px', borderRadius: '30px', 
          textAlign: 'center', width: '100%', maxWidth: '340px', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)' 
        }}>
          <h1 style={{ color: 'var(--primary-blue)', marginBottom: '10px', fontSize: '26px' }}>
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
        </form>
      </div>
    );
  }

  // --- ГЛАВНЫЙ ИНТЕРФЕЙС (После входа) ---
  return (
    <div className="main-layout">
      {/* Sidebar управляет навигацией */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="content-area">
        {/* Переключатель контента в зависимости от выбранной вкладки */}
        
        {activeTab === 'dashboard' && <Dashboard />}
        
        {activeTab === 'labs' && <Labs />}
        
        {activeTab === 'stats' && (
          <div className="lab-card" style={{ background: 'white', padding: '40px' }}>
            <h2 style={{ color: 'var(--primary-blue)' }}>Статистика семестра 📈</h2>
            <p style={{ color: 'var(--text-gray)' }}>
              Здесь скоро появятся графики твоей успеваемости, Александра.
            </p>
            <div className="done-separator" style={{ margin: '20px 0' }}></div>
            <p style={{ fontSize: '14px', opacity: 0.6 }}>Группа: 314302</p>
          </div>
        )}

        {/* Новая вкладка для Админа */}
        {activeTab === 'admin' && <AdminPanel />}
        
      </main>
    </div>
  );
}

export default App;