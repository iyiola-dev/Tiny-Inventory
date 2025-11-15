import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStores } from '../api/hooks';
import type { Store } from '../types/api';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const StoreList = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useStores({ page, limit: 10 });

  if (isLoading) return <LoadingSpinner message="Loading stores..." />;
  if (error) return <ErrorMessage message="Failed to load stores" />;
  if (!data) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
        <div className="text-sm text-gray-600">
          Total: {data.pagination.total} stores
        </div>
      </div>

      {data.stores.length === 0 ? (
        <Card>
          <p className="text-gray-600 text-center py-8">No stores found</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.stores.map((store: Store) => (
            <Link key={store.id} to={`/stores/${store.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {store.name}
                </h2>
                <p className="text-gray-600 mb-4">{store.location}</p>
                <div className="text-sm text-gray-500">
                  Created: {new Date(store.createdAt).toLocaleDateString()}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {data.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm">
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
