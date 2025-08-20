import { DEFAULT_HEADERS, API_BASE_URL } from './config';

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new HttpError(response.status, error.message);
  }
  return response.json();
}

function getHeaders(): Record<string, string> {
  return { ...DEFAULT_HEADERS };
}

export const httpClient = {
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const headers = getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
    });
    const data = await handleResponse<T>(response);
    return { data };
  },

  async post<T>(endpoint: string, data: any): Promise<{ data: T }> {
    const headers = getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<T>(response);
    return { data: responseData };
  },

  async put<T>(endpoint: string, data: any): Promise<{ data: T }> {
    const headers = getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<T>(response);
    return { data: responseData };
  },

  async patch<T>(endpoint: string, data: any): Promise<{ data: T }> {
    const headers = getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    const responseData = await handleResponse<T>(response);
    return { data: responseData };
  },

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    const headers = getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    const responseData = await handleResponse<T>(response);
    return { data: responseData };
  },
};