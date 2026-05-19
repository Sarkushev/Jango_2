import { useState, useEffect } from 'react';
import axios from 'axios';
import * as api from './api';
import { useCart } from './hooks';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import AdminProducts from './components/AdminProducts';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('products'); // products, cart, checkout, orders, profile
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState(null);
  
  // Форма входа/регистрации
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Корзина
  const {
    cart,
    loading: cartLoading,
    error: cartError,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    fetchCart
  } = useCart(isAuthenticated);

  // Проверить аутентификацию при загрузке
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await api.getProfile();
        setProfile(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
      }
    }
  };

  // Регистрация
  const handleRegister = async () => {
    if (password !== password2) {
      setAuthMessage('Пароли не совпадают');
      return;
    }
    try {
      await api.register(username, password, password2);
      setAuthMessage('Регистрация успешна! Теперь войдите.');
      setIsLogin(true);
      setUsername('');
      setPassword('');
      setPassword2('');
    } catch (error) {
      const errorMsg = error.response?.data?.username?.[0] ||
                       error.response?.data?.password?.[0] ||
                       error.response?.data?.detail ||
                       'Ошибка регистрации';
      setAuthMessage(`Ошибка: ${errorMsg}`);
    }
  };

  // Вход
  const handleLogin = async () => {
    try {
      const response = await api.login(username, password);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setAuthMessage('Вход успешен!');
      await checkAuth();
      setShowAuthForm(false);
      setUsername('');
      setPassword('');
      setPassword2('');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Ошибка входа';
      setAuthMessage(`Ошибка: ${errorMsg}`);
    }
  };

  // Выход
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setProfile(null);
    setCurrentPage('products');
    setAuthMessage('Вы вышли из системы');
  };

  // Добавить товар в корзину
  const handleAddToCart = (productId, productName) => {
    addItem(productId);
    setAuthMessage(`${productName} добавлен в корзину`);
    setTimeout(() => setAuthMessage(''), 2000);
  };

  // После создания заказа
  const handleOrderCreated = async (order) => {
    await clear();
    setCurrentPage('orders');
    setTimeout(() => setCurrentPage('products'), 3000);
  };

  // Подсчет товаров в корзине
  const cartItemsCount = cart?.items?.length || 0;

  return (
    <div className="app">
      {/* Навигация */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={() => setCurrentPage('products')}>
            PC Market
          </div>

          <ul className="navbar-menu">
            <li>
              <button
                className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
                onClick={() => setCurrentPage('products')}
              >
                Каталог
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${currentPage === 'cart' ? 'active' : ''}`}
                onClick={() => setCurrentPage('cart')}
              >
                Корзина {cartItemsCount > 0 && `(${cartItemsCount})`}
              </button>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <button
                    className={`nav-link ${currentPage === 'orders' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('orders')}
                  >
                    Заказы
                  </button>
                </li>
                {profile?.is_staff && (
                  <li>
                    <button
                      className={`nav-link admin-link ${currentPage === 'admin' ? 'active' : ''}`}
                      onClick={() => setCurrentPage('admin')}
                    >
                      Админ-панель
                    </button>
                  </li>
                )}
                <li>
                  <button className="nav-link profile-link">
                    {profile?.username}
                  </button>
                </li>
                <li>
                  <button className="nav-link logout-btn" onClick={handleLogout}>
                    Выход
                  </button>
                </li>
              </>
            )}
            {!isAuthenticated && (
              <li>
                <button
                  className="nav-link auth-btn"
                  onClick={() => setShowAuthForm(true)}
                >
                  Вход / Регистрация
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Сообщения */}
      {authMessage && (
        <div className={`message ${authMessage.includes('Ошибка') ? 'error' : 'success'}`}>
          {authMessage}
        </div>
      )}
      {cartError && (
        <div className="message error">{cartError}</div>
      )}

      {/* Модал авторизации */}
      {showAuthForm && (
        <div className="modal-overlay" onClick={() => setShowAuthForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthForm(false)}>✕</button>
            
            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Вход
              </button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Регистрация
              </button>
            </div>

            <div className="auth-form">
              {isLogin ? (
                <>
                  <h2>Вход</h2>
                  <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="auth-submit" onClick={handleLogin}>
                    Войти
                  </button>
                </>
              ) : (
                <>
                  <h2>Регистрация</h2>
                  <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                  <button className="auth-submit" onClick={handleRegister}>
                    Зарегистрироваться
                  </button>
                </>
              )}
              {authMessage && (
                <div className={`auth-message ${authMessage.includes('Ошибка') ? 'error' : 'success'}`}>
                  {authMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <main className="main-content">
        {currentPage === 'products' && (
          <ProductList onAddToCart={handleAddToCart} />
        )}

        {currentPage === 'cart' && (
          <Cart
            cart={cart}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
            onClear={clear}
            isAuthenticated={isAuthenticated}
          />
        )}

        {currentPage === 'cart' && cartItemsCount > 0 && (
          <div className="checkout-button-section">
            {!isAuthenticated ? (
              <div className="checkout-auth-prompt">
                <p>Пожалуйста, <button onClick={() => setShowAuthForm(true)} className="link-btn">войдите</button> для оформления заказа</p>
              </div>
            ) : (
              <button
                className="btn-to-checkout"
                onClick={() => setCurrentPage('checkout')}
              >
                Перейти к оформлению
              </button>
            )}
          </div>
        )}

        {currentPage === 'checkout' && (
          <Checkout
            cart={cart}
            isAuthenticated={isAuthenticated}
            onOrderCreated={handleOrderCreated}
            profile={profile}
          />
        )}

        {currentPage === 'orders' && (
          <Orders isAuthenticated={isAuthenticated} />
        )}

        {currentPage === 'admin' && profile?.is_staff && (
          <AdminProducts />
        )}
      </main>

      {/* Подвал */}
      <footer className="footer">
        <p>&copy; 2024 PC Market. Все права защищены.</p>
      </footer>
    </div>
  );
}

export default App;