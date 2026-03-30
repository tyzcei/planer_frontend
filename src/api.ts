import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

// 1. ИНТЕРЦЕПТОР ЗАПРОСА: Добавляем токен в каждый поход на сервер
api.interceptors.request.use((config) => {
  // Используем 'accessToken', как в твоем App.tsx
  const token = localStorage.getItem('accessToken'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. ИНТЕРЦЕПТОР ОТВЕТА: Ловим момент, когда сервер говорит "Твой билет просрочен"
api.interceptors.response.use(
  (response) => response, // Если всё хорошо, просто отдаем данные дальше
  (error) => {
    // Если бэкенд вернул 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn("Сессия истекла. Очищаем мусор и идем на логин.");
      
      localStorage.removeItem('accessToken'); // Сами убираем плохой токен
      
      // Выкидываем пользователя на вход, если он еще не там
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;