import axios from "axios";
import { logger } from "../utils/logger";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging (development only)
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      logger.info(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      logger.error("[API Error]", error.response?.data || error.message);
    }

    // Handle specific error cases
    if (error.response?.status === 404) {
      logger.error("Resource not found");
    } else if (error.response?.status === 500) {
      logger.error("Server error");
    }

    return Promise.reject(error);
  },
);

export default api;
