import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const successResponse = <T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> => {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
};

export const errorResponse = (
  message: string,
  code?: string,
  details?: any
): ApiResponse => {
  return {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  };
};

export const sendSuccess = <T>(
  reply: FastifyReply,
  data: T,
  meta?: ApiResponse['meta'],
  statusCode = 200
) => {
  return reply.status(statusCode).send(successResponse(data, meta));
};

export const sendError = (
  reply: FastifyReply,
  statusCode: number,
  message: string,
  code?: string,
  details?: any
) => {
  return reply.status(statusCode).send(errorResponse(message, code, details));
};


export const notFoundError = (reply: FastifyReply, resource = 'Resource') => {
  return sendError(reply, 404, `${resource} not found`, 'NOT_FOUND');
};

export const validationError = (reply: FastifyReply, details?: any) => {
  return sendError(reply, 400, 'Validation failed', 'VALIDATION_ERROR', details);
};

export const badRequestError = (reply: FastifyReply, message: string, details?: any) => {
  return sendError(reply, 400, message, 'BAD_REQUEST', details);
};
