// lib/api/service.ts
import axios from 'axios';

// Prefer explicit NEXT_PUBLIC_BACKEND_URL, but fall back to NEXT_PUBLIC_API_URL
// which is used elsewhere in the project. Empty string will make axios
// issue same-origin requests (useful for Next API stubs).
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_BACKEND_URL as string) ||
  (process.env.NEXT_PUBLIC_API_URL as string) ||
  "";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SSR-safe localStorage access
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// SSR-safe redirect
const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

// Types (keep your existing types here)
export interface SupportedNetwork {
  value: string;
  label: string;
  name: string;
}

export interface DataPlan {
  dataplanId: string;
  name: string;
  amount: string;
  validity: string;
  networkCode: string;
}

export interface ElectricityCompany {
  value: string;
  label: string;
  code: string;
  minAmount: number;
  maxAmount: number;
}

export interface MeterType {
  value: string;
  label: string;
  code: string;
}

export interface ExpectedAmount {
  cryptoAmount: number;
  cryptoCurrency: string;
  fiatAmount: number;
  chain: string;
  instructions: string;
  planDetails?: {
    id?: string;
    name: string;
    amount?: string;
    validity?: string;
  };
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchaseId: string;
    amount?: number;
    network?: string;
    phoneNumber?: string;
    providerReference?: string;
    cryptoAmount: number;
    cryptoCurrency: string;
    deliveredAt: Date;
    meterToken?: string;
    planName?: string;
  };
}

export interface MeterVerificationResponse {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    meterNumber: string;
    company: string;
    details: any;
  };
}

// API functions (keep your existing functions)
export const airtimeAPI = {
  getSupportedNetworks: async (): Promise<SupportedNetwork[]> => {
    const response = await api.get('/airtime/supported-options');
    return response.data.data.networks;
  },

  getExpectedAmount: async (amount: number, chain: string): Promise<ExpectedAmount> => {
    const response = await api.get('/airtime/expected-amount', {
      params: { amount, chain },
    });
    return response.data.data;
  },

  purchase: async (data: {
    type: 'airtime';
    amount: number;
    chain: string;
    phoneNumber: string;
    mobileNetwork: string;
    transactionHash: string;
  }): Promise<PurchaseResponse> => {
    const response = await api.post('/airtime/purchase', data);
    return response.data;
  },

  getHistory: async (limit: number = 10) => {
    const response = await api.get('/airtime/history', { params: { limit } });
    return response.data;
  },
};

export const dataAPI = {
  getSupportedNetworks: async (): Promise<SupportedNetwork[]> => {
    const response = await api.get('/data/supported-options');
    return response.data.data.networks;
  },

  getDataPlans: async (network: string, refresh: boolean = false): Promise<DataPlan[]> => {
    const response = await api.get('/data/plans', {
      params: { network, refresh },
    });
    return response.data.data.plans;
  },

  getExpectedAmount: async (
    dataplanId: string,
    network: string,
    chain: string
  ): Promise<ExpectedAmount> => {
    const response = await api.get('/data/expected-amount', {
      params: { dataplanId, network, chain },
    });
    return response.data.data;
  },

  purchase: async (data: {
    type: 'data';
    dataplanId: string;
    amount: number;
    chain: string;
    phoneNumber: string;
    mobileNetwork: string;
    transactionHash: string;
  }): Promise<PurchaseResponse> => {
    const response = await api.post('/data/purchase', data);
    return response.data;
  },

  getHistory: async (limit: number = 10) => {
    const response = await api.get('/data/history', { params: { limit } });
    return response.data;
  },
};

export const electricityAPI = {
  getSupportedOptions: async (): Promise<{
    companies: ElectricityCompany[];
    meterTypes: MeterType[];
  }> => {
    const response = await api.get('/electricity/supported-options');
    return {
      companies: response.data.data.companies,
      meterTypes: response.data.data.meterTypes,
    };
  },

  verifyMeter: async (
    company: string,
    meterNumber: string
  ): Promise<MeterVerificationResponse> => {
    const response = await api.get('/electricity/verify-meter', {
      params: { company, meterNumber },
    });
    return response.data;
  },

  getExpectedAmount: async (amount: number, chain: string): Promise<ExpectedAmount> => {
    const response = await api.get('/electricity/expected-amount', {
      params: { amount, chain },
    });
    return response.data.data;
  },

  purchase: async (data: {
    type: 'electricity';
    amount: number;
    chain: string;
    company: string;
    meterType: string;
    meterNumber: string;
    phoneNumber: string;
    transactionHash: string;
  }): Promise<PurchaseResponse> => {
    const response = await api.post('/electricity/purchase', data);
    return response.data;
  },

  getHistory: async (limit: number = 10) => {
    const response = await api.get('/electricity/history', { params: { limit } });
    return response.data;
  },
};

export default api;