import { Link, Outlet, useLocation } from 'react-router-dom';

export const Layout = () => {
  const location = useLocation();
  const isStoresPage = location.pathname === '/' || location.pathname.startsWith('/stores');
  const isProductsPage = location.pathname.startsWith('/products');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Tiny Inventory
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isStoresPage
                      ? 'text-black-900 font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Stores
                </Link>
                <Link
                  to="/products"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isProductsPage
                      ? 'text-black-900 font-bold'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
