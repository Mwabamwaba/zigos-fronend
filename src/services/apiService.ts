import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Response interceptor for basic error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }

  // Application-specific API methods

  // SOW-related methods (examples)
  async getSOWs() {
    try {
      const response = await this.get('/sow');
      return response.data;
    } catch (error) {
      console.error('Failed to get SOWs:', error);
      throw error;
    }
  }

  async createSOW(sowData: any) {
    try {
      const response = await this.post('/sow', sowData);
      return response.data;
    } catch (error) {
      console.error('Failed to create SOW:', error);
      throw error;
    }
  }

  async updateSOW(id: string, sowData: any) {
    try {
      const response = await this.put(`/sow/${id}`, sowData);
      return response.data;
    } catch (error) {
      console.error('Failed to update SOW:', error);
      throw error;
    }
  }

  async deleteSOW(id: string) {
    try {
      const response = await this.delete(`/sow/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete SOW:', error);
      throw error;
    }
  }

  // Project-related methods (examples)
  async getProjects() {
    try {
      const response = await this.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }

      // Authentication-related methods
    async verifyAuth(idToken: string) {
      try {
        const response = await this.post('/auth/verify', { idToken });
        return response.data;
      } catch (error) {
        console.error('Failed to verify auth:', error);
        throw error;
      }
    }

    async registerUser(userData: { name: string; email: string; azureAdObjectId?: string }) {
      try {
        const response = await this.post('/auth/register', userData);
        return response.data;
      } catch (error) {
        console.error('Failed to register user:', error);
        throw error;
      }
    }

    // Get the underlying axios instance for advanced usage
    getAxiosInstance(): AxiosInstance {
      return this.api;
    }
  }

  // Create and export singleton instance
  const apiService = new ApiService();
  export default apiService;
