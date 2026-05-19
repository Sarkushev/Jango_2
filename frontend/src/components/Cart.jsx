import { useState, useEffect } from 'react';
import * as api from '../api';
import './Cart.css';

export default function Cart({ cart, onRemoveItem, onUpdateQuantity, onClear, isAuthenticated }) {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      fetchProductDetails();
    }
  }, [cart]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const productIds = [...new Set(cart.items.map(item => item.product).filter(Boolean))];
      const productPromises = productIds.map(id => api.getProduct(id));
      const responses = await Promise.all(productPromises);
      
      const productsMap = {};
      responses.forEach(res => {
        productsMap[res.data.id] = res.data;
      });
      setProducts(productsMap);
    } catch (err) {
      console.error('Ошибка загрузки информации о товарах', err);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Корзина</h2>
        <p>Корзина пуста</p>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const product = products[item.product];
    if (!product) return sum;
    return sum + (product.price * item.quantity);
  }, 0);

  return (
    <div className="cart">
      <h2>Корзина ({cart.items.length} товаров)</h2>

      <table className="cart-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Цена</th>
            <th>Количество</th>
            <th>Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map(item => {
            const product = products[item.product];
            if (!product && loading) return null;
            if (!product) return null;

            const itemTotal = product.price * item.quantity;

            return (
              <tr key={item.id}>
                <td>
                  <div className="cart-item-name">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="cart-item-image" />
                    )}
                    <div>
                      <strong>{product.name}</strong>
                      <p className="cart-item-category">{product.category_name}</p>
                    </div>
                  </div>
                </td>
                <td className="cart-item-price">{product.price} ₽</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                </td>
                <td className="cart-item-total">{itemTotal} ₽</td>
                <td>
                  <button
                    className="btn-remove"
                    onClick={() => onRemoveItem(item.id)}
                    title="Удалить из корзины"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Итого:</span>
          <strong className="total-price">{total.toFixed(2)} ₽</strong>
        </div>
      </div>

      <div className="cart-actions">
        <button className="btn-clear" onClick={onClear}>
          Очистить корзину
        </button>
      </div>
    </div>
  );
}
