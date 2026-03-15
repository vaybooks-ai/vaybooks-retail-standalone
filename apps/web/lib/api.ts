export class ApiClient {
  public baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = 'http://localhost:3001/api/v1') {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Network error',
        message: response.statusText,
      }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    const data = await response.json();
    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key].toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    return this.handleResponse<T>(response);
  }

  setAuthToken(token: string) {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  clearAuthToken() {
    const { Authorization, ...headers } = this.headers as any;
    this.headers = headers;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper function for Tauri environment
export function getApiUrl(): string {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    // Running in Tauri, use localhost
    return 'http://localhost:3001/api/v1';
  }
  // Running in browser, use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
}

// Initialize with correct URL
if (typeof window !== 'undefined') {
  apiClient.baseUrl = getApiUrl();
}
