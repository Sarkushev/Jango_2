import { useState, useEffect } from 'react';
import * as api from '../api';
import './Orders.css';

export default function Orders({ isAuthenticated }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders();
      setOrders(response.data.results || response.data);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="orders">
        <div className="orders-empty">
          <h2>Мои заказы</h2>
          <p>Пожалуйста, войдите для просмотра заказов</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="orders-loading">Загрузка заказов...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <h2>Мои заказы</h2>
        <div className="orders-empty-message">
          <p>У вас нет заказов</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      paid: '#17a2b8',
      shipped: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      shipped: 'Отправлен',
      delivered: 'Доставлен',
      cancelled: 'Отменён',
    };
    return labels[status] || status;
  };

  return (
    <div className="orders">
      <h2>Мои заказы ({orders.length})</h2>

      {error && <div className="orders-error">{error}</div>}

      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Заказ №{order.id}</h3>
                <p className="order-date">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </div>
            </div>

            <div className="order-items">
              <h4>Товары:</h4>
              <ul>
                {order.items.map(item => (
                  <li key={item.id}>
                    <span className="item-name">
                      {item.product_detail?.name || item.listing_detail?.title}
                    </span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">{item.price} ₽</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-footer">
              <div className="order-total">
                Сумма: <strong>{order.total_price} ₽</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
