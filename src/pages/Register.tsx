import { useState, useEffect } from 'react';
import api from '../api';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    groupNumber: ''
  });
  
  const [bsuirGroups, setBsuirGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('https://iis.bsuir.by/api/v1/student-groups', {
          headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        const groupNames = data.map((g: any) => g.name).sort();
        setBsuirGroups(groupNames);
      } catch (err) {
        console.error("Не удалось загрузить группы", err);
        setError("Не удалось загрузить список учебных групп.");
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Небольшая проверка, чтобы юзер не ввел случайные буквы вместо группы
    if (!bsuirGroups.includes(formData.groupNumber) && bsuirGroups.length > 0) {
      setError('Пожалуйста, выберите существующую группу из списка.');
      return;
    }

    try {
      const response = await api.post('/auth/register', formData);
      localStorage.setItem('accessToken', response.data.accessToken);
      onRegisterSuccess();
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('Пользователь с таким Email уже существует!');
      } else {
        setError('Ошибка при регистрации. Проверьте подключение к серверу.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg-light)', padding: '20px' }}>
      <div className="fade-in" style={{ background: 'white', padding: '40px', borderRadius: '28px', width: '100%', maxWidth: '450px', boxShadow: '0 15px 40px rgba(15, 45, 77, 0.08)' }}>
        
        <h2 style={{ color: 'var(--color-dark-navy)', textAlign: 'center', margin: '0 0 10px 0', fontSize: '28px' }}>
          PassPort 🎓
        </h2>
        <p style={{ color: 'var(--text-gray)', textAlign: 'center', marginBottom: '30px' }}>
          Создайте аккаунт
        </p>
        
        {error && <div style={{ color: 'white', background: 'var(--error-red)', padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input name="firstName" className="form-input" placeholder="Имя" value={formData.firstName} onChange={handleChange} required />
            <input name="lastName" className="form-input" placeholder="Фамилия" value={formData.lastName} onChange={handleChange} required />
          </div>

          <input name="email" type="email" className="form-input" placeholder="Учебный Email" value={formData.email} onChange={handleChange} required />
          <input name="password" type="password" className="form-input" placeholder="Пароль" value={formData.password} onChange={handleChange} required minLength={6} />
          
          {/* УМНЫЙ ПОИСК ГРУППЫ */}
          <div style={{ position: 'relative' }}>
            <input 
              name="groupNumber" 
              list="bsuir-groups-list"
              className="form-input" 
              placeholder={loadingGroups ? '⏳ Загрузка групп...' : '🔍 Начните вводить номер группы...'}
              value={formData.groupNumber} 
              onChange={handleChange} 
              required
              disabled={loadingGroups}
              autoComplete="off"
            />
            <datalist id="bsuir-groups-list">
              {bsuirGroups.map(group => (
                <option key={group} value={group} />
              ))}
            </datalist>
          </div>

          <button type="submit" className="add-btn" style={{ marginTop: '15px', padding: '16px', fontSize: '16px' }}>
            Зарегистрироваться
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-gray)', fontSize: '15px' }}>
          Уже есть аккаунт?{' '}
          <span onClick={onSwitchToLogin} style={{ color: 'var(--color-purple)', cursor: 'pointer', fontWeight: '800' }}>
            Войти
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;