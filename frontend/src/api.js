import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

// Создаем axios инстанс с перехватчиком токена
const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обновление токена при 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const response = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', response.data.access);
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Products
export const getProducts = () => api.get('/products/');
export const getProduct = (id) => api.get(`/products/${id}/`);
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}/`, data);
export const partialUpdateProduct = (id, data) => api.patch(`/products/${id}/`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);

// Categories
export const getCategories = () => api.get('/categories/');

// Cart (для авторизованных пользователей)
export const getCart = () => api.get('/cart/');
export const addToCart = (productId, quantity = 1) =>
  api.post('/cart/add_item/', { product_id: productId, quantity });
export const removeFromCart = (itemId) =>
  api.delete('/cart/remove_item/', { data: { item_id: itemId } });
export const clearCart = () => api.delete('/cart/clear/');

// Orders
export const createOrder = () => api.post('/orders/', {});
export const getOrders = () => api.get('/orders/');
export const getOrder = (id) => api.get(`/orders/${id}/`);

// Auth
export const register = (username, password, password2) =>
  api.post('/auth/register/', { username, password, password2 });
export const login = (username, password) =>
  api.post('/auth/login/', { username, password });
export const getProfile = () => api.get('/auth/profile/');
