import { useState } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true); // true = вход, false = регистрация
  // Поля для регистрации
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  // Поля для входа
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Общее сообщение
  const [message, setMessage] = useState('');
  // Данные профиля (после входа)
  const [profile, setProfile] = useState(null);

  // Регистрация
  const handleRegister = async () => {
    if (password !== password2) {
      setMessage('Пароли не совпадают');
      return;
    }
    try {
      await axios.post('http://localhost:8000/api/auth/register/', {
        username,
        password,
        password2
      });
      setMessage('Регистрация成功. Теперь войдите.');
      setUsername('');
      setPassword('');
      setPassword2('');
      setIsLogin(true); // переключаем на форму входа
    } catch (error) {
      showError(error);
    }
  };

  // Логин (получение токенов)
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username: loginUsername,
        password: loginPassword
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setMessage('Вход выполнен успешно!');
      fetchProfile(); // загружаем профиль после логина
    } catch (error) {
      showError(error);
    }
  };

  // Получение профиля (защищённый эндпоинт)
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:8000/api/auth/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Токен просрочен — попробуем обновить
        refreshToken();
      } else {
        showError(error);
      }
    }
  };

  // Обновление токена
  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return;
    try {
      const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
        refresh
      });
      localStorage.setItem('access_token', response.data.access);
      fetchProfile(); // повторный запрос профиля
    } catch (error) {
      console.error('Ошибка обновления токена', error);
      logout();
    }
  };

  // Выход
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setProfile(null);
    setMessage('Вы вышли из системы');
    setIsLogin(true);
  };

  // Отображение ошибок из ответа сервера
  const showError = (error) => {
    if (error.response) {
      const data = error.response.data;
      let errMsg = 'Ошибка: ';
      if (data.detail) errMsg += data.detail;
      else if (data.username) errMsg += `username: ${data.username.join(', ')}; `;
      else if (data.password) errMsg += `password: ${data.password.join(', ')}; `;
      else if (data.password2) errMsg += `password2: ${data.password2.join(', ')}; `;
      else if (data.non_field_errors) errMsg += data.non_field_errors.join(', ');
      else errMsg += JSON.stringify(data);
      setMessage(errMsg);
    } else if (error.request) {
      setMessage('Сервер не отвечает. Запущен ли Docker?');
    } else {
      setMessage('Ошибка: ' + error.message);
    }
  };

  // Если пользователь уже авторизован, показываем профиль
  if (profile) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Профиль пользователя</h1>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
        <button onClick={logout}>Выйти</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>PC Market API + React</h1>
      <div>
        <button onClick={() => setIsLogin(true)} disabled={isLogin}>Вход</button>
        <button onClick={() => setIsLogin(false)} disabled={!isLogin}>Регистрация</button>
      </div>

      {isLogin ? (
        <div>
          <h2>Вход</h2>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '250px' }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '250px' }}
          />
          <button onClick={handleLogin}>Войти</button>
        </div>
      ) : (
        <div>
          <h2>Регистрация</h2>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '250px' }}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '250px' }}
          />
          <input
            type="password"
            placeholder="Подтверждение пароля"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '250px' }}
          />
          <button onClick={handleRegister}>Зарегистрироваться</button>
        </div>
      )}
      <p style={{ marginTop: '1rem', color: message.includes('успешно') ? 'green' : 'red' }}>{message}</p>
    </div>
  );
}

export default App;