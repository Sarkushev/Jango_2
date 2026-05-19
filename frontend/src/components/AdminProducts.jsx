import { useState, useEffect } from 'react';
import * as api from '../api';
import './AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(productsRes.data.results || productsRes.data);
      setCategories(categoriesRes.data.results || categoriesRes.data);
      setError('');
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      stock: '',
      image: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Валидация
      if (!formData.name || !formData.category || !formData.price || !formData.stock) {
        setError('Заполните все обязательные поля');
        setLoading(false);
        return;
      }

      const data = {
        name: formData.name,
        category: parseInt(formData.category),
        price: parseFloat(formData.price),
        description: formData.description,
        stock: parseInt(formData.stock),
        image: formData.image
      };

      if (editingId) {
        // Обновление
        await api.updateProduct(editingId, data);
        setSuccess('Товар обновлен');
      } else {
        // Создание
        await api.createProduct(data);
        setSuccess('Товар создан');
      }

      await fetchData();
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                      err.response?.data?.name?.[0] ||
                      'Ошибка при сохранении товара';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock,
      image: product.image
    });
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        setLoading(true);
        await api.deleteProduct(id);
        setSuccess('Товар удален');
        await fetchData();
      } catch (err) {
        setError('Ошибка при удалении товара');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && products.length === 0) {
    return <div className="admin-loading">Загрузка...</div>;
  }

  return (
    <div className="admin-products">
      <h2>Управление товарами</h2>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div className="admin-form-container">
          <div className="admin-form-header">
            <h3>{editingId ? 'Редактирование товара' : 'Добавление товара'}</h3>
            <button className="form-close" onClick={resetForm}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Название товара"
                  required
                />
              </div>

              <div className="form-group">
                <label>Категория *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Цена (₽) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Количество в наличии *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Описание товара"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>URL изображения</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Сохранение...' : (editingId ? 'Обновить' : 'Создать')}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Кнопка добавления */}
      {!showForm && (
        <button className="btn-add-product" onClick={() => setShowForm(true)}>
          + Добавить товар
        </button>
      )}

      {/* Таблица товаров */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Количество</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.id}>
                  <td>#{product.id}</td>
                  <td className="product-name-cell">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="product-thumb" />
                    )}
                    <div>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <p className="product-desc">{product.description.substring(0, 50)}...</p>
                      )}
                    </div>
                  </td>
                  <td>{product.category_name}</td>
                  <td className="price-cell">{product.price} ₽</td>
                  <td className="stock-cell">
                    <span className={product.stock > 0 ? 'stock-ok' : 'stock-low'}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(product)}
                      title="Редактировать"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-message">
                  Товары не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
