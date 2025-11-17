import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import * as storesService from '../services/stores.js';
import { sendSuccess, notFoundError, validationError } from '../utils/response.js';

const createStoreSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().min(1).max(255),
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

const storesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /stores - List all stores
  fastify.get('/stores', async (request, reply) => {
    try {
      const query = paginationSchema.parse(request.query);
      const result = await storesService.getAllStores(query.page, query.limit);
      return sendSuccess(reply, result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(reply, error.errors);
      }
      throw error;
    }
  });

  // GET /stores/:id - Get store details
  fastify.get('/stores/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const store = await storesService.getStoreById(id);
    
    if (!store) {
      return notFoundError(reply, 'Store');
    }
    
    return sendSuccess(reply, store);
  });

  // POST /stores - Create new store
  fastify.post('/stores', async (request, reply) => {
    try {
      const data = createStoreSchema.parse(request.body);
      const store = await storesService.createStore(data);
      return sendSuccess(reply, store, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(reply, error.errors);
      }
      throw error;
    }
  });

  // GET /stores/:id/products - List products in store
  fastify.get('/stores/:id/products', async (request, reply) => {
    const { id } = request.params as { id: string };
    const querySchema = paginationSchema.extend({
      category: z.string().optional(),
    });
    
    try {
      const query = querySchema.parse(request.query);
      
      // Check if store exists
      const store = await storesService.getStoreById(id);
      if (!store) {
        return notFoundError(reply, 'Store');
      }
      
      const result = await storesService.getStoreProducts(
        id,
        query.page,
        query.limit,
        query.category
      );
      
      return sendSuccess(reply, result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationError(reply, error.errors);
      }
      throw error;
    }
  });

  // GET /stores/:id/analytics - Get store analytics
  fastify.get('/stores/:id/analytics', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Check if store exists
    const store = await storesService.getStoreById(id);
    if (!store) {
      return notFoundError(reply, 'Store');
    }
    
    const analytics = await storesService.getStoreAnalytics(id);
    return sendSuccess(reply, analytics);
  });
};

export default storesRoutes;
