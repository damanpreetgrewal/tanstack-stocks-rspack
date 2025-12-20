// Centralized configuration
// API_URL is injected by Rsbuild from .env
declare const API_URL: string;
declare const BASE_URL: string;

export const config = {
  apiUrl: API_URL,
  baseUrl: BASE_URL,
} as const;
