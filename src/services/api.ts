const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper para hacer requests
const request = async (endpoint: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Agregar token si existe
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ========== AUTH ==========
export const authService = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    artistName: string;
    role: string;
  }) => {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Guardar token
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Guardar token
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verify: async () => {
    return await request('/auth/verify');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ========== PRODUCTS ==========
export const productsService = {
  getAll: async (params?: { category?: string; featured?: boolean; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return await request(`/products${query ? `?${query}` : ''}`);
  },

  getById: async (id: number) => {
    return await request(`/products/${id}`);
  },

  getByCategory: async (slug: string) => {
    return await request(`/products/category/${slug}`);
  },
};

// ========== CONTACT ==========
export const contactService = {
  send: async (contactData: { name: string; email: string; message: string }) => {
    return await request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },

  getAll: async (params?: { status?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return await request(`/contact${query ? `?${query}` : ''}`);
  },
};

// ========== ORDERS ==========
export const ordersService = {
  create: async (orderData: { userId: number; items: any[]; paymentMethod?: string }) => {
    return await request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getByUser: async (userId: number) => {
    return await request(`/orders/${userId}`);
  },

  getDetail: async (orderId: number) => {
    return await request(`/orders/detail/${orderId}`);
  },
};

export default {
  auth: authService,
  products: productsService,
  contact: contactService,
  orders: ordersService,
};
