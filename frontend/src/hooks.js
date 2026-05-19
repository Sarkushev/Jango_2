import { useState, useEffect } from 'react';
import * as api from './api';

// Хук для управления корзиной - использует сервер для авторизованных, localStorage для гостей
export const useCart = (isAuthenticated) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Загрузить корзину
  const fetchCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const response = await api.getCart();
        setCart(response.data);
      } else {
        // Для гостей - читаем из localStorage
        const localCart = localStorage.getItem('guest_cart');
        setCart(localCart ? JSON.parse(localCart) : { items: [] });
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  };

  // Добавить товар в корзину
  const addItem = async (productId, quantity = 1) => {
    try {
      if (isAuthenticated) {
        await api.addToCart(productId, quantity);
      } else {
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items":[]}');
        const existingItem = localCart.items.find(item => item.product === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.items.push({ product: productId, quantity, id: Date.now() });
        }
        localStorage.setItem('guest_cart', JSON.stringify(localCart));
      }
      await fetchCart();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка добавления товара');
    }
  };

  // Удалить товар из корзины
  const removeItem = async (itemId) => {
    try {
      if (isAuthenticated) {
        await api.removeFromCart(itemId);
      } else {
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items":[]}');
        localCart.items = localCart.items.filter(item => item.id !== itemId);
        localStorage.setItem('guest_cart', JSON.stringify(localCart));
      }
      await fetchCart();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка удаления товара');
    }
  };

  // Очистить корзину
  const clear = async () => {
    try {
      if (isAuthenticated) {
        await api.clearCart();
      } else {
        localStorage.removeItem('guest_cart');
      }
      await fetchCart();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка очистки корзины');
    }
  };

  // Обновить количество товара
  const updateQuantity = async (itemId, quantity) => {
    try {
      if (isAuthenticated) {
        // На сервере нет обновления через PATCH, нужно удалить и добавить
        // Но сейчас просто обновим на фронте
        const updatedCart = {
          ...cart,
          items: cart.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        };
        setCart(updatedCart);
      } else {
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items":[]}');
        const item = localCart.items.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;
        }
        localStorage.setItem('guest_cart', JSON.stringify(localCart));
        setCart(localCart);
      }
    } catch (err) {
      setError(err.message || 'Ошибка обновления количества');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    removeItem,
    clear,
    updateQuantity
  };
};
