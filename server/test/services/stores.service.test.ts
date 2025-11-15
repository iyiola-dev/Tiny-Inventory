import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { stores, products } from '../../src/db/schema.js';
import { sql } from 'drizzle-orm';
import { setupTestDatabase, teardownTestDatabase, clearDatabase, testDb } from './test-db-setup.js';

describe('Stores Service Integration Tests', () => {
  let storesService: any;
  let productsService: any;
  let db: typeof testDb;

  beforeAll(async () => {
    const setup = await setupTestDatabase();
    db = setup.testDb;
    
    storesService = await import('../../src/services/stores.js');
    productsService = await import('../../src/services/products.js');
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('getAllStores', () => {
    it('should return empty list when no stores exist', async () => {
      const result = await storesService.getAllStores(1, 10);
      
      expect(result.stores).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('should return paginated stores', async () => {
      const store1 = await db.insert(stores).values({
        name: 'Store 1',
        location: 'Location 1',
      }).returning();
      
      const store2 = await db.insert(stores).values({
        name: 'Store 2',
        location: 'Location 2',
      }).returning();

      const result = await storesService.getAllStores(1, 10);
      
      expect(result.stores).toHaveLength(2);
      expect(result.stores[0].name).toBe('Store 1');
      expect(result.stores[1].name).toBe('Store 2');
      expect(result.pagination.total).toBe(2);
    });

    it('should handle pagination correctly', async () => {
      for (let i = 1; i <= 15; i++) {
        await db.insert(stores).values({
          name: `Store ${i}`,
          location: `Location ${i}`,
        });
      }

      const page1 = await storesService.getAllStores(1, 10);
      expect(page1.stores).toHaveLength(10);
      expect(page1.pagination.totalPages).toBe(2);
      
      const page2 = await storesService.getAllStores(2, 10);
      expect(page2.stores).toHaveLength(5);
      expect(page2.pagination.page).toBe(2);
    });

    it('should exclude soft-deleted stores', async () => {
      const activeStore = await db.insert(stores).values({
        name: 'Active Store',
        location: 'Location 1',
      }).returning();
      
      const deletedStore = await db.insert(stores).values({
        name: 'Deleted Store',
        location: 'Location 2',
        deletedAt: new Date(),
      }).returning();

      const result = await storesService.getAllStores(1, 10);
      
      expect(result.stores).toHaveLength(1);
      expect(result.stores[0].name).toBe('Active Store');
    });
  });

  describe('getStoreById', () => {
    it('should return a store by id', async () => {
      const [created] = await db.insert(stores).values({
        name: 'Test Store',
        location: 'Test Location',
      }).returning();

      const store = await storesService.getStoreById(created.id);
      
      expect(store).not.toBeNull();
      expect(store?.name).toBe('Test Store');
      expect(store?.location).toBe('Test Location');
    });

    it('should return null for non-existent store', async () => {
      const store = await storesService.getStoreById('550e8400-e29b-41d4-a716-446655440000');
      expect(store).toBeNull();
    });

    it('should return null for soft-deleted store', async () => {
      const [created] = await db.insert(stores).values({
        name: 'Deleted Store',
        location: 'Location',
        deletedAt: new Date(),
      }).returning();

      const store = await storesService.getStoreById(created.id);
      expect(store).toBeNull();
    });
  });

  describe('createStore', () => {
    it('should create a new store', async () => {
      const storeData = {
        name: 'New Store',
        location: 'New Location',
      };

      const created = await storesService.createStore(storeData);
      
      expect(created).toBeDefined();
      expect(created.name).toBe('New Store');
      expect(created.location).toBe('New Location');
      expect(created.id).toBeDefined();
      expect(created.createdAt).toBeDefined();
    });
  });

  describe('getStoreProducts', () => {
    it('should return products for a store', async () => {
      const [store] = await db.insert(stores).values({
        name: 'Test Store',
        location: 'Location',
      }).returning();

      await db.insert(products).values([
        {
          storeId: store.id,
          name: 'Product 1',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: store.id,
          name: 'Product 2',
          category: 'Books',
          price: '19.99',
          quantity: 5,
        },
      ]);

      const result = await storesService.getStoreProducts(store.id, 1, 10);
      
      expect(result.products).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter by category', async () => {
      const [store] = await db.insert(stores).values({
        name: 'Test Store',
        location: 'Location',
      }).returning();

      await db.insert(products).values([
        {
          storeId: store.id,
          name: 'Electronics Product',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: store.id,
          name: 'Book Product',
          category: 'Books',
          price: '19.99',
          quantity: 5,
        },
      ]);

      const result = await storesService.getStoreProducts(store.id, 1, 10, 'Electronics');
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].category).toBe('Electronics');
    });

    it('should exclude soft-deleted products', async () => {
      const [store] = await db.insert(stores).values({
        name: 'Test Store',
        location: 'Location',
      }).returning();

      await db.insert(products).values([
        {
          storeId: store.id,
          name: 'Active Product',
          category: 'Electronics',
          price: '99.99',
          quantity: 10,
        },
        {
          storeId: store.id,
          name: 'Deleted Product',
          category: 'Books',
          price: '19.99',
          quantity: 5,
          deletedAt: new Date(),
        },
      ]);

      const result = await storesService.getStoreProducts(store.id, 1, 10);
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Active Product');
    });
  });

  describe('getStoreAnalytics', () => {
    it('should calculate correct analytics', async () => {
      const [store] = await db.insert(stores).values({
        name: 'Analytics Store',
        location: 'Location',
      }).returning();

      await db.insert(products).values([
        {
          storeId: store.id,
          name: 'Product 1',
          category: 'Electronics',
          price: '100.00',
          quantity: 20,
        },
        {
          storeId: store.id,
          name: 'Product 2',
          category: 'Electronics',
          price: '50.00',
          quantity: 5,
        },
        {
          storeId: store.id,
          name: 'Product 3',
          category: 'Books',
          price: '25.00',
          quantity: 0,
        },
      ]);

      const analytics = await storesService.getStoreAnalytics(store.id);
      
      expect(analytics.totalProducts).toBe(3);
      expect(Number(analytics.totalValue)).toBe(2250);
      expect(Number(analytics.avgProductPrice)).toBeCloseTo(58.33, 1);
      expect(Number(analytics.lowStockItems)).toBe(1);
      expect(Number(analytics.outOfStockItems)).toBe(1);
      expect(Number(analytics.categories)).toBe(2);
      expect(analytics.categoryBreakdown).toHaveLength(2);
      
      const electronicsCategory = analytics.categoryBreakdown.find((c: any) => c.category === 'Electronics');
      expect(electronicsCategory?.count).toBe(2);
      expect(Number(electronicsCategory?.totalValue)).toBe(2250);
    });

    it('should return zeros for store with no products', async () => {
      const [store] = await db.insert(stores).values({
        name: 'Empty Store',
        location: 'Location',
      }).returning();

      const analytics = await storesService.getStoreAnalytics(store.id);
      
      expect(analytics.totalProducts).toBe(0);
      expect(Number(analytics.totalValue || 0)).toBe(0);
      expect(Number(analytics.avgProductPrice || 0)).toBe(0);
      expect(Number(analytics.lowStockItems || 0)).toBe(0);
      expect(Number(analytics.outOfStockItems || 0)).toBe(0);
      expect(Number(analytics.categories || 0)).toBe(0);
      expect(analytics.categoryBreakdown).toEqual([]);
    });
  });

  describe('deleteStore', () => {
    it('should soft delete a store', async () => {
      const [store] = await db.insert(stores).values({
        name: 'Store to Delete',
        location: 'Location',
      }).returning();

      const deleted = await storesService.deleteStore(store.id);
      
      expect(deleted).toBeDefined();
      expect(deleted?.deletedAt).toBeDefined();

      const [dbStore] = await db
        .select()
        .from(stores)
        .where(sql`${stores.id} = ${store.id}`);
      
      expect(dbStore.deletedAt).not.toBeNull();
    });

    it('should return null when deleting non-existent store', async () => {
      const deleted = await storesService.deleteStore('550e8400-e29b-41d4-a716-446655440000');
      expect(deleted).toBeNull();
    });
  });
});
