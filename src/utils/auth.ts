import { jwtDecode } from "jwt-decode";

// 1. Описываем полную структуру данных, которые зашиты в JWT на бэкенде
interface DecodedToken {
  sub: string;          // email пользователя
  role: string;         // роль (ADMIN, STUDENT, GROUP_LEADER)
  userId: number;       // ID из базы данных
  groupNumber?: string; // Номер группы
  exp: number;          // Время жизни токена
  firstName?: string;   // Имя
  lastName?: string;    // <--- ДОБАВЛЕНО: Фамилия (должна приходить из JWT)
}

// 2. Описываем тип объекта, который мы хотим использовать в React-компонентах
interface UserProfile {
  role: string;
  userId: number;
  email: string;
  group: string | undefined;
  firstName: string;
  lastName: string;     // <--- ДОБАВЛЕНО
}

export const getUserData = (): UserProfile | null => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Проверяем, не протух ли токен (опционально, но полезно)
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem('accessToken');
      return null;
    }

    return {
      role: decoded.role,
      userId: decoded.userId,
      email: decoded.sub,
      group: decoded.groupNumber,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '' // <--- Теперь TS будет видеть это поле
    };
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};