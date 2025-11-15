import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import * as productsService from '../services/products.js';
import { sendSuccess, notFoundError, validationError, badRequestError } from '../utils/response.js';

const createProductSchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().min(0),
});

const updateProductSchema = createProductSchema.partial().omit({ storeId: true });

const productFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  category: z.string().optional(),
  storeId: z.string().uuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
});

const productsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /products - List all products with filters
  fastify.get('/products', async (request, reply) => {
    try {
      const query = productFiltersSchema.parse(request.query);
      const { page, limit, ...filters } = query;
      
      const result = await productsService.getAllProducts(page, limit, filters);
      return sendSuccess(reply, result.products, { pagination: result.pagination });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(reply, error.errors);
      }
      throw error;
    }
  });

  // GET /products/:id - Get product details
  fastify.get('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const product = await productsService.getProductById(id);
    
    if (!product) {
      return notFoundError(reply, 'Product');
    }
    
    return sendSuccess(reply, product);
  });

  // POST /products - Create new product
  fastify.post('/products', async (request, reply) => {
    try {
      const data = createProductSchema.parse(request.body);
      const product = await productsService.createProduct({
        ...data,
        price: data.price.toString(),
      });
      return sendSuccess(reply, product, undefined, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(reply, error.errors);
      }
      throw error;
    }
  });

  // PATCH /products/:id - Update product
  fastify.patch('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    try {
      const data = updateProductSchema.parse(request.body);
      
      
      if (Object.keys(data).length === 0) {
        return badRequestError(reply, 'No fields to update');
      }
      
    
      const updateData: any = { ...data };
      if (data.price !== undefined) {
        updateData.price = data.price.toString();
      }
      
      const product = await productsService.updateProduct(id, updateData);
      
      if (!product) {
        return notFoundError(reply, 'Product');
      }
      
      return sendSuccess(reply, product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(reply, error.errors);
      }
      throw error;
    }
  });

  // DELETE /products/:id - Delete product (soft delete)
  fastify.delete('/products/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const product = await productsService.deleteProduct(id);
    
    if (!product) {
      return notFoundError(reply, 'Product');
    }
    
    return sendSuccess(reply, { message: 'Product deleted successfully', id: product.id });
  });
};

export default productsRoutes;
