import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import API from '../utils/api';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || '';
  const heatLevel = searchParams.get('heatLevel') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set('search', search);
    if (heatLevel) params.set('heatLevel', heatLevel);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    API.get(`/products?${params}`)
      .then(res => { setProducts(res.data.products); setTotal(res.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, heatLevel, sort, minPrice, maxPrice, page]);

  const updateFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="card p-4">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Filters</h3>

              <div className="mb-5">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Heat Level</h4>
                {['Mild', 'Medium', 'Hot', 'Very Hot', 'Extra Hot'].map(h => (
                  <label key={h} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="heat"
                      checked={heatLevel === h}
                      onChange={() => updateFilter('heatLevel', h)}
                      className="text-red-600"
                    />
                    <span className="text-sm text-gray-600">{h}</span>
                  </label>
                ))}
                {heatLevel && (
                  <button onClick={() => updateFilter('heatLevel', '')} className="text-xs text-red-600 mt-1">Clear</button>
                )}
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={e => updateFilter('minPrice', e.target.value)}
                    className="input w-20 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={e => updateFilter('maxPrice', e.target.value)}
                    className="input w-20 text-xs"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Sort By</h4>
                {[
                  { value: '', label: 'Newest' },
                  { value: 'price_asc', label: 'Price: Low to High' },
                  { value: 'price_desc', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Best Rating' },
                  { value: 'popular', label: 'Most Popular' },
                ].map(s => (
                  <label key={s.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="radio" name="sort" checked={sort === s.value} onChange={() => updateFilter('sort', s.value)} className="text-red-600" />
                    <span className="text-sm text-gray-600">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {search ? `Results for "${search}"` : heatLevel ? `${heatLevel} Chilli Powder` : 'All Products'}
                </h1>
                {!loading && <p className="text-xs text-gray-500">{total} products</p>}
              </div>
              {/* Mobile sort */}
              <select
                className="md:hidden input w-auto text-xs"
                value={sort}
                onChange={e => updateFilter('sort', e.target.value)}
              >
                <option value="">Sort: Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="spinner"></div></div>
            ) : products.length === 0 ? (
              <div className="card text-center py-16">
                <p className="text-4xl mb-3">🌶️</p>
                <p className="text-gray-600 font-medium">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try different filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {/* Pagination */}
                {total > 12 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-sm rounded-sm border ${page === p ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
