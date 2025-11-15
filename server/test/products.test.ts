import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import productsRoutes from '../src/routes/products.js';
import * as productsService from '../src/services/products.js';

vi.mock('../src/services/products.js', () => ({
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

describe('Products Routes', () => {
  let app: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    app = Fastify({ logger: false });
    await app.register(productsRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return paginated products', async () => {
      const mockResponse = {
        products: [
          { id: '1', name: 'Product 1', price: '99.99', quantity: 10 },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      (productsService.getAllProducts as any).mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'GET',
        url: '/products?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: mockResponse.products,
        meta: { pagination: mockResponse.pagination },
      });
    });

    it('should handle filtering by category', async () => {
      const mockResponse = {
        products: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      (productsService.getAllProducts as any).mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: 'GET',
        url: '/products?category=Electronics',
      });

      expect(response.statusCode).toBe(200);
      expect(productsService.getAllProducts).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ category: 'Electronics' })
      );
    });

    it('should return 400 for invalid pagination params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/products?page=-1',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Validation failed');
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      const mockProduct = { 
        id: '123', 
        name: 'Test Product', 
        price: '99.99',
        quantity: 5 
      };

      (productsService.getProductById as any).mockResolvedValue(mockProduct);

      const response = await app.inject({
        method: 'GET',
        url: '/products/123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: mockProduct,
      });
    });

    it('should return 404 when product not found', async () => {
      (productsService.getProductById as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/products/nonexistent',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Product not found');
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        storeId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Product',
        category: 'Electronics',
        price: 199.99,
        quantity: 10,
      };

      const createdProduct = { 
        id: '123e4567-e89b-12d3-a456-426614174000', 
        ...newProduct, 
        price: '199.99' 
      };
      (productsService.createProduct as any).mockResolvedValue(createdProduct);

      const response = await app.inject({
        method: 'POST',
        url: '/products',
        payload: newProduct,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: createdProduct,
      });
    });

    it('should return 400 for invalid product data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/products',
        payload: { name: 'Invalid' }, // Missing required fields
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Validation failed');
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', async () => {
      const updates = { price: 149.99, quantity: 5 };
      const updatedProduct = { 
        id: '123', 
        name: 'Product', 
        price: '149.99',
        quantity: 5 
      };

      (productsService.updateProduct as any).mockResolvedValue(updatedProduct);

      const response = await app.inject({
        method: 'PATCH',
        url: '/products/123',
        payload: updates,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toEqual({
        success: true,
        data: updatedProduct,
      });
    });

    it('should return 404 when updating nonexistent product', async () => {
      (productsService.updateProduct as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'PATCH',
        url: '/products/nonexistent',
        payload: { price: 100 },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      const deletedProduct = { id: '123', name: 'Deleted Product' };
      (productsService.deleteProduct as any).mockResolvedValue(deletedProduct);

      const response = await app.inject({
        method: 'DELETE',
        url: '/products/123',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('Product deleted successfully');
      expect(body.data.id).toBe('123');
    });

    it('should return 404 when deleting nonexistent product', async () => {
      (productsService.deleteProduct as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'DELETE',
        url: '/products/nonexistent',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
