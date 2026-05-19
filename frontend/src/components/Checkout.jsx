import { useState } from 'react';
import * as api from '../api';
import './Checkout.css';

export default function Checkout({ cart, isAuthenticated, onOrderCreated, profile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="checkout">
        <div className="checkout-warning">
          <h3>Для оформления заказа требуется авторизация</h3>
          <p>Пожалуйста, войдите в свой аккаунт или зарегистрируйтесь</p>
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="checkout">
        <div className="checkout-empty">
          <h3>Корзина пуста</h3>
          <p>Добавьте товары для оформления заказа</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.createOrder();
      setSuccessMessage(`Заказ №${response.data.id} успешно создан!`);
      onOrderCreated(response.data);
      
      // Очистить форму
      setTimeout(() => {
        setEmail('');
        setPhone('');
        setAddress('');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      'Ошибка при создании заказа';
      setError(errorMsg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">
      <h2>Оформление заказа</h2>

      {error && <div className="checkout-error">{error}</div>}
      {successMessage && <div className="checkout-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-section">
          <h3>Контактная информация</h3>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Телефон (опционально)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 999-99-99"
            />
          </div>

          <div className="form-group">
            <label>Адрес доставки (опционально)</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ваш адрес доставки"
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Товары в заказе</h3>
          <p className="items-count">Товаров в корзине: {cart.items.length}</p>
        </div>

        <button
          type="submit"
          className="btn-checkout"
          disabled={loading}
        >
          {loading ? 'Создание заказа...' : 'Создать заказ'}
        </button>
      </form>
    </div>
  );
}
