// API Response Types

export interface Store {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoreAnalytics {
  totalProducts: number;
  totalValue: number;
  avgProductPrice: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    totalValue: number;
  }>;
}

export interface PaginationResponse<T> {
  [key: string]: T[] | any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}
