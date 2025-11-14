import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import storesRoutes from './routes/stores.js';
import productsRoutes from './routes/products.js';

// Load environment variables
config();

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create Fastify instance with environment-aware logger
const fastify = Fastify({
  logger: isDevelopment
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
            colorize: true,
          },
        },
      }
    : {
        level: 'info',
      },
});

// Register plugins
await fastify.register(cors, {
  origin: true,
});

// Request logging hook
fastify.addHook('onRequest', async (request, reply) => {
  request.log.info({ url: request.url, method: request.method }, 'Incoming request');
});

fastify.addHook('onResponse', async (request, reply) => {
  request.log.info(
    {
      url: request.url,
      method: request.method,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime(),
    },
    'Request completed'
  );
});

// Register routes
await fastify.register(storesRoutes);
await fastify.register(productsRoutes);

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Handle database errors
  if (error.code === 'P2002') {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'A record with this value already exists',
    });
  }
  
  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
    });
  }
  
  // Default error response
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
});

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
