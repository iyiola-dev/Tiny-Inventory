import { eq, sql, count, and, isNull } from 'drizzle-orm';
import { db, stores, products } from '../db/index.js';
import type { NewStore } from '../db/schema.js';

export async function getAllStores(page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  const [items, totalCount] = await Promise.all([
    db.select().from(stores).where(isNull(stores.deletedAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(stores).where(isNull(stores.deletedAt)),
  ]);

  return {
    stores: items,
    pagination: {
      page,
      limit,
      total: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / limit),
    },
  };
}

export async function getStoreById(id: string) {
  const result = await db.select().from(stores).where(and(eq(stores.id, id), isNull(stores.deletedAt)));
  return result[0] || null;
}

export async function createStore(data: NewStore) {
  const result = await db.insert(stores).values(data).returning();
  return result[0];
}

export async function getStoreProducts(storeId: string, page = 1, limit = 10, category?: string) {
  const offset = (page - 1) * limit;
  
  const conditions = [eq(products.storeId, storeId), isNull(products.deletedAt)];
  if (category) {
    conditions.push(eq(products.category, category));
  }
  
  const whereClause = and(...conditions);
  
  const [items, totalCount] = await Promise.all([
    db.select().from(products).where(whereClause).limit(limit).offset(offset),
    db.select({ count: count() }).from(products).where(whereClause),
  ]);

  return {
    products: items,
    pagination: {
      page,
      limit,
      total: totalCount[0].count,
      totalPages: Math.ceil(totalCount[0].count / limit),
    },
  };
}

export async function getStoreAnalytics(storeId: string) {
  // Aggregate analytics with multiple metrics
  const result = await db
    .select({
      totalProducts: count(),
      totalValue: sql<number>`sum(${products.price} * ${products.quantity})`,
      avgProductPrice: sql<number>`avg(${products.price})`,
      lowStockItems: sql<number>`count(case when ${products.quantity} < 10 and ${products.quantity} > 0 then 1 end)`,
      outOfStockItems: sql<number>`count(case when ${products.quantity} = 0 then 1 end)`,
      categories: sql<number>`count(distinct ${products.category})`,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), isNull(products.deletedAt)));

  const categoryBreakdown = await db
    .select({
      category: products.category,
      count: count(),
      totalValue: sql<number>`sum(${products.price} * ${products.quantity})`,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), isNull(products.deletedAt)))
    .groupBy(products.category);

  return {
    totalProducts: result[0]?.totalProducts || 0,
    totalValue: result[0]?.totalValue || 0,
    avgProductPrice: result[0]?.avgProductPrice || 0,
    lowStockItems: result[0]?.lowStockItems || 0,
    outOfStockItems: result[0]?.outOfStockItems || 0,
    categories: result[0]?.categories || 0,
    categoryBreakdown,
  };
}

export async function deleteStore(id: string) {
  const result = await db
    .update(stores)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(stores.id, id), isNull(stores.deletedAt)))
    .returning();
  return result[0] || null;
}
