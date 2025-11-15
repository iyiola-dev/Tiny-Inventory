import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import storesRoutes from '../src/routes/stores.js';
import * as storesService from '../src/services/stores.js';


vi.mock('../src/services/stores.js', () => ({
  getAllStores: vi.fn(),
  getStoreById: vi.fn(),
  createStore: vi.fn(),
  getStoreProducts: vi.fn(),
  getStoreAnalytics: vi.fn(),
}));

describe('Stores Routes', () => {
  let app: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    app = Fastify({ logger: false });
    await app.register(storesRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /stores', () => {
    it('should return paginated stores', async () => {
      const mockResponse = {
        stores: [
          { id: '1', name: 'Store 1', location: 'Location 1' },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      (storesService.getAllStores as any).mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'GET',
        url: '/stores?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should return 400 for invalid pagination params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/stores?page=0',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /stores/:id', () => {
    it('should return a store by id', async () => {
      const mockStore = { 
        id: '123', 
        name: 'Test Store', 
        location: 'Test Location',
        createdAt: new Date().toISOString()
      };

      (storesService.getStoreById as any).mockResolvedValue(mockStore);

      const response = await app.inject({
        method: 'GET',
        url: '/stores/123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: mockStore,
      });
    });

    it('should return 404 when store not found', async () => {
      (storesService.getStoreById as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/stores/nonexistent',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Store not found');
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /stores', () => {
    it('should create a new store', async () => {
      const newStore = {
        name: 'New Store',
        location: 'New Location',
      };

      const createdStore = { 
        id: '123e4567-e89b-12d3-a456-426614174000', 
        ...newStore,
        createdAt: new Date().toISOString()
      };
      (storesService.createStore as any).mockResolvedValue(createdStore);

      const response = await app.inject({
        method: 'POST',
        url: '/stores',
        payload: newStore,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: createdStore,
      });
    });

    it('should return 400 for invalid store data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/stores',
        payload: { name: '' }, 
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /stores/:id/products', () => {
    it('should return products for a store', async () => {
      const mockStore = { id: '123', name: 'Store' };
      const mockResponse = {
        products: [
          { id: '1', name: 'Product 1', storeId: '123' },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      (storesService.getStoreById as any).mockResolvedValue(mockStore);
      (storesService.getStoreProducts as any).mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'GET',
        url: '/stores/123/products',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should return 404 when store not found', async () => {
      (storesService.getStoreById as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/stores/nonexistent/products',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /stores/:id/analytics', () => {
    it('should return analytics for a store', async () => {
      const mockStore = { id: '123', name: 'Store' };
      const mockAnalytics = {
        totalProducts: 10,
        totalValue: 1000,
        avgProductPrice: 100,
        lowStockItems: 2,
        outOfStockItems: 1,
        categories: 5,
        categoryBreakdown: [],
      };

      (storesService.getStoreById as any).mockResolvedValue(mockStore);
      (storesService.getStoreAnalytics as any).mockResolvedValue(mockAnalytics);

      const response = await app.inject({
        method: 'GET',
        url: '/stores/123/analytics',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: mockAnalytics,
      });
    });

    it('should return 404 when store not found', async () => {
      (storesService.getStoreById as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/stores/nonexistent/analytics',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });
});
