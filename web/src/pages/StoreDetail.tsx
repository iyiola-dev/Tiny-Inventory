import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, useStoreAnalytics, useStoreProducts } from '../api/hooks';
import type { Product } from '../types/api';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const StoreDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [productsPage, setProductsPage] = useState(1);
  const { data: store, isLoading: storeLoading, error: storeError } = useStore(id!);
  const { data: analytics, isLoading: analyticsLoading } = useStoreAnalytics(id!);
  const { data: products, isLoading: productsLoading } = useStoreProducts(id!, { page: productsPage, limit: 5 });

  if (storeLoading) return <LoadingSpinner message="Loading store..." />;
  if (storeError) return <ErrorMessage message="Failed to load store" />;
  if (!store) return <ErrorMessage message="Store not found" />;

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        ← Back to Stores
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
        <p className="text-lg text-gray-600">{store.location}</p>
      </div>

      {/* Analytics Section */}
      {analyticsLoading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : analytics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts || 0}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Value</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${(analytics.totalValue || 0).toLocaleString()}
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Avg Product Price</h3>
            <p className="text-3xl font-bold text-gray-900">
              ${analytics.avgProductPrice ? Number(analytics.avgProductPrice).toFixed(2) : '0.00'}
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Low Stock Items</h3>
            <p className="text-3xl font-bold text-orange-600">{analytics.lowStockItems || 0}</p>
            <p className="text-sm text-gray-500 mt-1">&lt; 10 units</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Out of Stock</h3>
            <p className="text-3xl font-bold text-red-600">{analytics.outOfStockItems || 0}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{analytics.categories || 0}</p>
          </Card>
        </div>
      ) : null}

      {/* Category Breakdown */}
      {analytics && analytics.categoryBreakdown.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-xl text-center font-semibold mb-9">Category Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.categoryBreakdown.map((category) => (
                  <tr key={category.category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${category.totalValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Products Section */}
      <Card>
        <h2 className="text-xl text-center font-semibold mb-4">Products</h2>
        {productsLoading ? (
          <LoadingSpinner message="Loading products..." />
        ) : products && products.products.length > 0 ? (
          <>
            <div className="space-y-4">
              {products.products.map((product: Product) => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${product.price}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {products.pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                  disabled={productsPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {productsPage} of {products.pagination.totalPages}
                </span>
                <button
                  onClick={() => setProductsPage((p) => Math.min(products.pagination.totalPages, p + 1))}
                  disabled={productsPage === products.pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600 text-center py-8">No products found for this store</p>
        )}
      </Card>
    </div>
  );
};
