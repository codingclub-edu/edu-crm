import axios from "axios";
import { accessTokenAtom, userAtom, authStore } from "../store/auth";

const api = axios.create({
  baseURL: "/api", // relative → Vite proxy forwards to the real server
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);
const setToken = (token) => {
  authStore.set(accessTokenAtom, token);
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Used by AuthContext.restoreSession and the 401 retry interceptor
export const callRefresh = () =>
  api.post("/auth/refresh", {}, { _isRefresh: true });

// ── Request: attach current access token ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = authStore.get(accessTokenAtom);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptors ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => {
    // Backend auto-refreshes on GET/PUT /auth/me — new token arrives in header
    const newToken = res.headers["x-access-token"];
    if (newToken) setToken(newToken);
    return res;
  },

  async (error) => {
    const original = error.config;

    // Refresh call itself failed — just reject, let the caller decide what to do
    // Never redirect here to avoid infinite reload loops
    if (original?._isRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) =>
        failedQueue.push({ resolve, reject }),
      )
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        })
        .catch(Promise.reject);
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await callRefresh();
      setToken(data.accessToken);
      if (data.user) authStore.set(userAtom, data.user);
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setToken(null);
      authStore.set(userAtom, null);
      // Only redirect here — a real API call failed even after a refresh attempt
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
