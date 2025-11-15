import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { stores, products } from '../../src/db/schema.js';
import { sql } from 'drizzle-orm';
import { setupTestDatabase, teardownTestDatabase, clearDatabase, testDb } from './test-db-setup.js';

describe('Products Service Integration Tests', () => {
  let productsService: any;
  let testStoreId: string;
  let db: typeof testDb;

  beforeAll(async () => {
    const setup = await setupTestDatabase();
    db = setup.testDb;
    
    productsService = await import('../../src/services/products.js');
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    const [store] = await db.insert(stores).values({
      name: 'Test Store',
      location: 'Test Location',
    }).returning();
    
    testStoreId = store.id;
  });

  describe('getAllProducts', () => {
    it('should return empty list when no products exist', async () => {
      const result = await productsService.getAllProducts(1, 10, {});
      
      expect(result.products).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('should return paginated products', async () => {
      await db.insert(products).values([
        {
          storeId: testStoreId,
          name: 'Product 1',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: testStoreId,
          name: 'Product 2',
          category: 'Books',
          price: '19.99',
          quantity: 5,
        },
      ]);

      const result = await productsService.getAllProducts(1, 10, {});
      
      expect(result.products).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by category', async () => {
      await db.insert(products).values([
        {
          storeId: testStoreId,
          name: 'Electronics Product',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: testStoreId,
          name: 'Book Product',
          category: 'Books',
          price: '19.99',
          quantity: 5,
        },
      ]);

      const result = await productsService.getAllProducts(1, 10, { category: 'Electronics' });
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].category).toBe('Electronics');
    });

    it('should filter by storeId', async () => {
      const [store2] = await db.insert(stores).values({
        name: 'Store 2',
        location: 'Location 2',
      }).returning();

      await db.insert(products).values([
        {
          storeId: testStoreId,
          name: 'Product 1',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: store2.id,
          name: 'Product 2',
          category: 'Books',
          price: '19.99',
          quantity: 5,
        },
      ]);

      const result = await productsService.getAllProducts(1, 10, { storeId: testStoreId });
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].storeId).toBe(testStoreId);
    });

    it('should filter by price range', async () => {
      await db.insert(products).values([
        {
          storeId: testStoreId,
          name: 'Cheap Product',
          category: 'Electronics',
          price: '10.00',
          quantity: 10,
        },
        {
          storeId: testStoreId,
          name: 'Expensive Product',
          category: 'Electronics',
          price: '100.00',
          quantity: 5,
        },
      ]);

      const result = await productsService.getAllProducts(1, 10, { 
        minPrice: 50,
        maxPrice: 150 
      });
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Expensive Product');
    });

    it('should search by name', async () => {
      await db.insert(products).values([
        {
          storeId: testStoreId,
          name: 'Laptop Pro',
          category: 'Electronics',
          price: '1000.00',
          quantity: 10,
        },
        {
          storeId: testStoreId,
          name: 'Mouse Pad',
          category: 'Accessories',
          price: '10.00',
          quantity: 50,
        },
      ]);

      const result = await productsService.getAllProducts(1, 10, { search: 'Laptop' });
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Laptop Pro');
    });

    it('should exclude soft-deleted products', async () => {
      await db.insert(products).values([
        {
          storeId: testStoreId,
          name: 'Active Product',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: testStoreId,
          name: 'Deleted Product',
          category: 'Books',
          price: '19.99',
          quantity: 5,
          deletedAt: new Date(),
        },
      ]);

      const result = await productsService.getAllProducts(1, 10, {});
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Active Product');
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const [created] = await db.insert(products).values({
        storeId: testStoreId,
        name: 'Test Product',
        category: 'Electronics',
        price: '99.99',
        quantity: 10,
      }).returning();

      const product = await productsService.getProductById(created.id);
      
      expect(product).not.toBeNull();
      expect(product?.name).toBe('Test Product');
      expect(product?.price).toBe('99.99');
    });

    it('should return null for non-existent product', async () => {
      const product = await productsService.getProductById('550e8400-e29b-41d4-a716-446655440000');
      expect(product).toBeNull();
    });

    it('should return null for soft-deleted product', async () => {
      const [created] = await db.insert(products).values({
        storeId: testStoreId,
        name: 'Deleted Product',
        category: 'Electronics',
        price: '99.99',
        quantity: 10,
        deletedAt: new Date(),
      }).returning();

      const product = await productsService.getProductById(created.id);
      expect(product).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        storeId: testStoreId,
        name: 'New Product',
        category: 'Electronics',
        price: '199.99',
        quantity: 25,
      };

      const created = await productsService.createProduct(productData);
      
      expect(created).toBeDefined();
      expect(created.name).toBe('New Product');
      expect(created.price).toBe('199.99');
      expect(created.quantity).toBe(25);
      expect(created.id).toBeDefined();
    });

    it('should handle decimal prices correctly', async () => {
      const productData = {
        storeId: testStoreId,
        name: 'Decimal Price Product',
        category: 'Electronics',
        price: '99.99',
        quantity: 1,
      };

      const created = await productsService.createProduct(productData);
      expect(created.price).toBe('99.99');
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const [created] = await db.insert(products).values({
        storeId: testStoreId,
        name: 'Original Product',
        category: 'Electronics',
        price: '99.99',
        quantity: 10,
      }).returning();

      const updated = await productsService.updateProduct(created.id, {
        name: 'Updated Product',
        price: '149.99',
        quantity: 20,
      });
      
      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated Product');
      expect(updated?.price).toBe('149.99');
      expect(updated?.quantity).toBe(20);
      expect(updated?.category).toBe('Electronics');
    });

    it('should update only specified fields', async () => {
      const [created] = await db.insert(products).values({
        storeId: testStoreId,
        name: 'Original Product',
        category: 'Electronics',
        price: '99.99',
        quantity: 10,
      }).returning();

      const updated = await productsService.updateProduct(created.id, {
        quantity: 5,
      });
      
      expect(updated?.quantity).toBe(5);
      expect(updated?.name).toBe('Original Product');
      expect(updated?.price).toBe('99.99');
    });

    it('should return null when updating non-existent product', async () => {
      const updated = await productsService.updateProduct(
        '550e8400-e29b-41d4-a716-446655440000',
        { name: 'New Name' }
      );
      
      expect(updated).toBeNull();
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      const [created] = await db.insert(products).values({
        storeId: testStoreId,
        name: 'Product to Delete',
        category: 'Electronics',
        price: '99.99',
        quantity: 10,
      }).returning();

      const deleted = await productsService.deleteProduct(created.id);
      
      expect(deleted).toBeDefined();
      expect(deleted?.deletedAt).toBeDefined();

      const [dbProduct] = await db
        .select()
        .from(products)
        .where(sql`${products.id} = ${created.id}`);
      
      expect(dbProduct.deletedAt).not.toBeNull();
    });

    it('should return null when deleting non-existent product', async () => {
      const deleted = await productsService.deleteProduct('550e8400-e29b-41d4-a716-446655440000');
      expect(deleted).toBeNull();
    });

    it('should not delete already soft-deleted product', async () => {
      const [created] = await db.insert(products).values({
        storeId: testStoreId,
        name: 'Already Deleted',
        category: 'Electronics',
        price: '99.99',
        quantity: 10,
        deletedAt: new Date(),
      }).returning();

      const deleted = await productsService.deleteProduct(created.id);
      expect(deleted).toBeNull();
    });
  });
});
