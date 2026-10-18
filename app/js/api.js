const api = axios.create({
  baseURL: "https://blog-posting-platform-beryl.vercel.app/api/v1",
  // baseURL: "http://127.0.0.1:8000/api/v1",
});

const PUBLIC_ENDPOINTS = [
  "/auth/register",
  "/auth/login",
  "/posts/get-all-posts",
];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const isPublic = PUBLIC_ENDPOINTS.some((some) => config.url?.includes(some));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isPublic = PUBLIC_ENDPOINTS.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (
      error.response?.status === 401 &&
      !isPublic &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refresh_token = localStorage.getItem("refreshToken");

        if (!refresh_token) {
          throw new Error("No Refresh TOken Available");
        }

        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refresh_token,
        });
        const newToken = res.data.access_token;

        localStorage.setItem("accessToken", newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (error) {
        localStorage.clear();
        //   window.location.href = "/";
        console.error(error.response.data.message);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
