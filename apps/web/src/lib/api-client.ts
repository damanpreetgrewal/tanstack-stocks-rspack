import { initClient } from '@ts-rest/core'
import { stocksContract } from '@stocks/contracts'
import axios from 'axios'

type ApiRequest = {
  method: string;
  path: string;
  body?: unknown;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
};

const API_URL = import.meta.env.API_URL || 'http://localhost:3000/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // Include cookies for auth
})

// Add request interceptor for logging
axiosInstance.interceptors.request.use((config) => {
  console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`❌ API Error:`, error.response?.data || error.message)
    throw error
  }
)

export const apiClient = initClient(stocksContract, {
  baseUrl: API_URL,
  api: async (args: ApiRequest) => {
    const response = await axiosInstance({
      method: args.method,
      url: args.path,
      data: args.body,
      // Use query for search params; params is for path params in ts-rest args
      params: args.query ?? args.params,
    })
    return { 
      status: response.status, 
      body: response.data,
      headers: new Headers(
        Object.entries(response.headers || {}).map(
          ([k, v]) => [k, String(v)] as [string, string],
        ),
      ),
    }
  },
})
