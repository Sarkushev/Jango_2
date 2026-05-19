import { useState, useEffect } from 'react';
import * as api from '../api';
import './ProductList.css';

export default function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('Ошибка загрузки товаров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="product-list">
      <h2>Каталог товаров</h2>
      
      {error && <div className="error">{error}</div>}

      {/* Фильтр по категориям */}
      <div className="category-filter">
        <button
          className={!selectedCategory ? 'active' : ''}
          onClick={() => setSelectedCategory(null)}
        >
          Все товары
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={selectedCategory === cat.id ? 'active' : ''}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Сетка товаров */}
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              {product.image && (
                <img src={product.image} alt={product.name} className="product-image" />
              )}
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category_name}</p>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                <div className="product-bottom">
                  <span className="product-price">{product.price} ₽</span>
                  <button
                    className="btn-add-to-cart"
                    onClick={() => onAddToCart(product.id, product.name)}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
                  </button>
                </div>
                {product.stock > 0 && (
                  <p className="stock">Осталось: {product.stock}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-products">Товары не найдены</p>
        )}
      </div>
    </div>
  );
}
