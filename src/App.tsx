import { useState, useEffect } from 'react'; 
import './styles/theme.css'; 
import Sidebar from './components/Sidebar'; 
import Dashboard from './pages/Dashboard'; 
import Labs from './pages/Labs'; 
import AdminPanel from './pages/AdminPanel'; 
import Register from './pages/Register'; 
import ScheduleWeek from './pages/ScheduleWeek'; 
import api from './api'; 
import GroupManagement from './pages/GroupManagement'; 
import { getUserData } from './utils/auth'; 
import Teachers from './pages/Teachers'; 
import Profile from './pages/Profile'; 
import Stats from './pages/Stats'; 

function App() { 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isAuthChecking, setIsAuthChecking] = useState(true); 
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [activeTab, setActiveTab] = useState('dashboard'); 

  useEffect(() => { 
    const checkAuth = () => { 
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        localStorage.setItem('accessToken', urlToken);
        window.history.replaceState({}, document.title, "/"); 
      }

      const token = localStorage.getItem('accessToken'); 
      if (!token) { 
        setIsLoggedIn(false); 
        setIsAuthChecking(false); 
        return; 
      } 
      const user = getUserData(); 
      if (!user) { 
        localStorage.removeItem('accessToken'); 
        setIsLoggedIn(false); 
      } else { 
        setIsLoggedIn(true); 
      } 
      setIsAuthChecking(false); 
    }; 
    checkAuth(); 
  }, []); 

  const handleLogin = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    try { 
      const response = await api.post('/auth/login', { email, password }); 
      const token = response.data.accessToken; 
      if (token) { 
        localStorage.setItem('accessToken', token); 
        setIsLoggedIn(true); 
        setEmail(''); 
        setPassword(''); 
      } 
    } catch (error: any) { 
      console.error("Login error:", error); 
      const message = error.response?.status === 401 ? 'Неверный email или пароль' : 'Сервер недоступен. Проверь работу бэкенда!'; 
      alert(message); 
    } 
  }; 

  const handleLogout = () => { 
    localStorage.removeItem('accessToken'); 
    setIsLoggedIn(false); 
    setActiveTab('dashboard'); 
  }; 

  if (isAuthChecking) { 
    return ( 
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-blue)', fontWeight: 'bold' }}> 
        Загрузка Semester Passport... 
      </div> 
    ); 
  } 

  if (!isLoggedIn) { 
    if (!isLoginMode) { 
      return ( 
        <Register onRegisterSuccess={() => setIsLoggedIn(true)} onSwitchToLogin={() => setIsLoginMode(true)} /> 
      ); 
    } 
    return ( 
      <div className="login-screen" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: 'var(--color-bg-light)' }}> 
        <form onSubmit={handleLogin} className="login-form" style={{ background: 'white', padding: '40px', borderRadius: '30px', textAlign: 'center', width: '100%', maxWidth: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}> 
          <h1 style={{ color: 'var(--color-dark-navy)', marginBottom: '10px', fontSize: '26px' }}> Semester Passport 🎓 </h1> 
          <p style={{ color: 'var(--text-gray)', marginBottom: '30px', fontSize: '14px' }}> Студенческий менеджер задач </p> 
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}> 
            <input type="email" placeholder="📧 Email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required /> 
            <input type="password" placeholder="🔒 Пароль" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required /> 
            <button type="submit" className="add-btn" style={{ width: '100%', marginTop: '10px' }}> Войти в кабинет </button> 
          </div> 

          <div style={{ margin: '20px 0', color: 'var(--text-gray)', fontSize: '14px', position: 'relative' }}>
            <div style={{ borderTop: '1px solid #e2e8f0', position: 'absolute', top: '50%', width: '100%', zIndex: 1 }}></div>
            <span style={{ background: 'white', padding: '0 10px', position: 'relative', zIndex: 2 }}>ИЛИ</span>
          </div>
          
          <a 
            href="http://localhost:8080/oauth2/authorization/github" 
            style={{ 
              display: 'block', width: '100%', padding: '12px', borderRadius: '12px', 
              background: '#24292e', color: 'white', textDecoration: 'none', 
              fontWeight: 'bold', fontSize: '15px', transition: '0.2s', marginBottom: '10px', boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1b1f23'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#24292e'}
          >
            🐙 Войти через GitHub
          </a>

          <p style={{ marginTop: '25px', color: 'var(--text-gray)', fontSize: '14px' }}> Нет аккаунта?{' '} 
            <span onClick={() => setIsLoginMode(false)} style={{ color: 'var(--color-purple)', cursor: 'pointer', fontWeight: 'bold' }} > Зарегистрироваться </span> 
          </p> 
        </form> 
      </div> 
    ); 
  } 

  return ( 
    <div className="main-layout"> 
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} /> 
      <main className="content-area"> 
        {activeTab === 'dashboard' && <Dashboard />} 
        {activeTab === 'schedule' && <ScheduleWeek />} 
        {activeTab === 'labs' && <Labs />} 
        {activeTab === 'teachers' && <Teachers />} 
        {activeTab === 'profile' && <Profile />} 
        {activeTab === 'admin' && <AdminPanel />} 
        {activeTab === 'group' && <GroupManagement />} 
        {activeTab === 'stats' && <Stats /> } 
      </main> 
    </div> 
  ); 
} 

export default App;