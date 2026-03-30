import { jwtDecode } from "jwt-decode";

// Описываем структуру того, что лежит внутри нашего токена
interface DecodedToken {
  sub: string;      // email
  role: string;     // роль (ADMIN, STUDENT, GROUP_LEADER)
  userId: number;   // ID пользователя
  groupNumber?: string;
  exp: number;      // время истечения
}

export const getUserData = () => {
  // Достаем токен (используем именно 'accessToken', как в твоем App.tsx)
  const token = localStorage.getItem('accessToken');
  
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      role: decoded.role,
      userId: decoded.userId,
      email: decoded.sub,
      group: decoded.groupNumber
    };
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};