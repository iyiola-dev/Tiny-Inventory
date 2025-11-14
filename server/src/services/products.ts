import { eq, and, like, gte, lte, count } from 'drizzle-orm';
import { db, products } from '../db/index.js';
import type { NewProduct } from '../db/schema.js';

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  storeId?: string;
}

export async function getAllProducts(
  page = 1,
  limit = 10,
  filters: ProductFilters = {}
) {
  const offset = (page - 1) * limit;
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(products.category, filters.category));
  }
  if (filters.storeId) {
    conditions.push(eq(products.storeId, filters.storeId));
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice.toString()));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice.toString()));
  }
  if (filters.search) {
    conditions.push(like(products.name, `%${filters.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalCount] = await Promise.all([
    db
      .select()
      .from(products)
      .where(whereClause)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(products)
      .where(whereClause),
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

export async function getProductById(id: string) {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id));
  return result[0] || null;
}

export async function createProduct(data: NewProduct) {
  const result = await db
    .insert(products)
    .values(data)
    .returning();
  return result[0];
}

export async function updateProduct(id: string, data: Partial<NewProduct>) {
  const result = await db
    .update(products)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteProduct(id: string) {
  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  return result[0] || null;
}
