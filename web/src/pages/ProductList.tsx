import { useState } from 'react';
import { useProducts } from '../api/hooks';
import type { Product } from '../types/api';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

const categories = ['All', 'Smartphones', 'Laptops', 'Tablets', 'Audio', 'Accessories', 'Monitors', 'Gaming', 'Wearables', 'Smart Home', 'Cameras'];

export const ProductList = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  

  const { data, isLoading, error } = useProducts({
    page,
    limit: 12,
    ...(selectedCategory !== 'All' && { category: selectedCategory }),
    
  });

  if (isLoading) return <LoadingSpinner message="Loading products..." />;
  if (error) return <ErrorMessage message="Failed to load products" />;
  if (!data) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Products</h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {data.products.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">
            No products found. Try adjusting your filters.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.products.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{product.category}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </p>
                  <p className={`text-sm mt-1 ${
                    product.quantity === 0
                      ? 'text-red-600 font-medium'
                      : product.quantity < 10
                      ? 'text-orange-600'
                      : 'text-gray-600'
                  }`}>
                    {product.quantity === 0
                      ? 'Out of stock'
                      : product.quantity < 10
                      ? `Only ${product.quantity} left`
                      : `${product.quantity} in stock`
                    }
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
