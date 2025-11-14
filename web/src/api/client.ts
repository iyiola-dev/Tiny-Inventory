// Type-safe API client

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || error.error || 'Request failed', error);
  }
  return response.json();
}

export const api = {
  get: async <T>(url: string, params?: Record<string, any>): Promise<T> => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${API_BASE_URL}${url}${queryString}`);
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    });
    return handleResponse<T>(response);
  },
};
