export type { Store, NewStore, Product, NewProduct } from '../db/schema.js';

export type { ApiResponse } from '../utils/response.js';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ProductFilters {
  category?: string;
  storeId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  totalValue: number;
}

export interface StoreAnalytics {
  totalProducts: number;
  totalValue: number;
  avgProductPrice: string | number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: number;
  categoryBreakdown: CategoryBreakdown[];
}
