const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api/v1",
});

const PUBLIC_ENDPOINTS = ["/auth/register", "/auth/login", "/posts/get-all-posts"];

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    const isPublic = PUBLIC_ENDPOINTS.some((some) => config.url?.includes(some))

    if (token && isPublic){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
});

api.interceptors.response.use(
    (response)=>{
        return response;
    },
    async(error) =>{
        const originalRequest = error.config;
        const isPublic = PUBLIC_ENDPOINTS.some((some)=>{originalRequest.url?.includes(url)})

        if(error.response?.status === 401 && !isPublic && !originalRequest._retry){
            originalRequest._retry = true;
            try{
                 const refreshToken = localStorage.getItem("refreshToken");

                 if (!refreshToken) {
                   throw new Error("No Refresh TOken Available");
                 }

                 const res = await api.post("/auth/refresh",{refreshToken});
                 localStorage.setItem("accessToken", res.data.accessToken);

                 originalRequest.headers.Authorization = `Bearer ${res.accessToken}`;
                 return axios(originalRequest);

            }catch(error){
                  localStorage.clear();
                  window.location.href = "/login";
                  console.error(err);
                  return Promise.reject(err);
                
            }
        }
        return Promise.reject(error)
    }
)
export default api;