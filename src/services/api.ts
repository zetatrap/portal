const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// Helper para hacer requests
const request = async (endpoint: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = { message: 'La API respondió con un formato no válido.' };
    }

    if (!response.ok) {
      throw new Error(data?.message || `Error en la petición (${response.status})`);
    }

    return data;
  } catch (error: any) {
    console.error('API Error:', {
      endpoint,
      url: `${API_URL}${endpoint}`,
      message: error?.message,
    });
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
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    try {
      await request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('user');
    }
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

export const adminProductsService = {
  getAll: async () => {
    return await request('/admin/products');
  },

  create: async (payload: {
    name: string;
    slug?: string;
    description: string;
    price: number | string;
    categorySlug?: string;
    imageUrl?: string;
    audioUrl?: string;
    rating?: number | string;
    isFeatured?: boolean;
    isActive?: boolean;
  }) => {
    return await request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update: async (id: number, payload: {
    name: string;
    slug?: string;
    description: string;
    price: number | string;
    categorySlug?: string;
    imageUrl?: string;
    audioUrl?: string;
    rating?: number | string;
    isFeatured?: boolean;
    isActive?: boolean;
  }) => {
    return await request(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  remove: async (id: number) => {
    return await request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
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
  create: async (orderData: {
    userId?: number | null;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerMessage?: string;
    items: Array<{ productId: number; quantity?: number; price?: number }>;
    paymentMethod?: string;
  }) => {
    return await request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  checkout: async (orderData: {
    userId?: number | null;
    buyerName?: string;
    buyerEmail?: string;
    buyerPhone?: string;
    buyerMessage?: string;
    items: Array<{ productId: number; quantity?: number; price?: number }>;
    paymentMethod?: string;
  }) => {
    return await request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  completeCheckout: async (orderId: number) => {
    return await request(`/orders/checkout/complete/${orderId}`, {
      method: 'POST',
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
  adminProducts: adminProductsService,
  contact: contactService,
  orders: ordersService,
};
