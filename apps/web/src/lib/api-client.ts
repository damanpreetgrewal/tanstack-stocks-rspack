import { initClient } from '@ts-rest/core';
import { stocksContract, portfolioContract } from '@stocks/contracts';
import axios from 'axios';
import { config } from './config';

type ApiRequest = {
  method: string;
  path: string;
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
};

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  withCredentials: true, // Include cookies for auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
axiosInstance.interceptors.request.use((config) => {
  console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`❌ API Error:`, error.response?.data || error.message);
    throw error;
  }
);

export const apiClient = initClient(stocksContract, {
  baseUrl: config.apiUrl,
  api: async (args: ApiRequest) => {
    const response = await axiosInstance({
      method: args.method,
      url: args.path,
      data: args.body,
      // Use query for search params; params is for path params in ts-rest args
      params: args.query ?? args.params,
    });
    return { 
      status: response.status, 
      body: response.data,
      headers: new Headers(
        Object.entries(response.headers || {}).map(
          ([k, v]) => [k, String(v)] as [string, string],
        ),
      ),
    };
  },
});

export const portfolioApiClient = initClient(portfolioContract, {
  baseUrl: config.apiUrl,
  api: async (args: ApiRequest) => {
    const response = await axiosInstance({
      method: args.method,
      url: args.path,
      data: args.body,
      params: args.query ?? args.params,
      headers: {
        ...args.headers,
        'Content-Type': 'application/json',
      },
    });
    return { 
      status: response.status, 
      body: response.data,
      headers: new Headers(
        Object.entries(response.headers || {}).map(
          ([k, v]) => [k, String(v)] as [string, string],
        ),
      ),
    };
  },
});
