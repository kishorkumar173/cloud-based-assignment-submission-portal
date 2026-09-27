import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("portal_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle common authentication errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn("Authentication required or session expired.");
    }

    if (error.response?.status === 403) {
      console.warn("You do not have permission for this operation.");
    }

    return Promise.reject(error);
  }
);

export default api;