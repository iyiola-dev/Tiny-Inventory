// TanStack Query hooks for API endpoints

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Store, Product, StoreAnalytics, StoresResponse, ProductsResponse, QueryParams } from '../types/api';

// Store hooks
export const useStores = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => api.get<StoresResponse>('/stores', params),
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: ['store', id],
    queryFn: () => api.get<Store>(`/stores/${id}`),
    enabled: !!id,
  });
};

export const useStoreAnalytics = (id: string) => {
  return useQuery({
    queryKey: ['store-analytics', id],
    queryFn: () => api.get<StoreAnalytics>(`/stores/${id}/analytics`),
    enabled: !!id,
  });
};

export const useStoreProducts = (storeId: string, params?: QueryParams) => {
  return useQuery({
    queryKey: ['store-products', storeId, params],
    queryFn: () => api.get<ProductsResponse>(`/stores/${storeId}/products`, params),
    enabled: !!storeId,
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; location: string }) => api.post<Store>('/stores', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

// Product hooks
export const useProducts = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => api.get<ProductsResponse>('/products', params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => 
      api.post<Product>('/products', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products', data.storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-analytics', data.storeId] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Product>) => 
      api.put<Product>(`/products/${id}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.id] });
      queryClient.invalidateQueries({ queryKey: ['store-products', data.storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-analytics', data.storeId] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
