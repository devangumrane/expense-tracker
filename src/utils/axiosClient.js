import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true, // important: allows HttpOnly cookie to be sent on refresh requests
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addSubscriber(cb) {
  refreshSubscribers.push(cb);
}

api.interceptors.request.use(
  (config) => {
    // attach access token from memory (window.__ACCESS_TOKEN__ or your store)
    const accessToken = window.__ACCESS_TOKEN__;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // try refresh
      if (isRefreshing) {
        // queue request until refresh finishes
        return new Promise((resolve, reject) => {
          addSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshRes = await api.post("/auth/refresh"); // sends cookie automatically
        const newAccessToken = refreshRes.data.accessToken;
        // store in memory
        window.__ACCESS_TOKEN__ = newAccessToken;
        isRefreshing = false;
        onRefreshed(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        // redirect to login
        window.__ACCESS_TOKEN__ = null;
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
