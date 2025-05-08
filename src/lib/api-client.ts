import axios, { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// // Auto retry on expired access tokens
// apiClient.interceptors.response.use(null, async (error) => {
//   if (error.response?.status === 401 && error.config && !error.config._retry) {
//     error.config._retry = true;
//     try {
//       // Attempt to refresh the token
//       await apiClient.patch("/api/sessions", undefined, {
//         ...error.config,
//         url: undefined,
//       });
//       return apiClient(error.config); // Retry the original request
//     } catch (refreshError) {
//       console.error("Token refresh failed. Redirecting to login...");
//       throw refreshError;
//     }
//   }
//   return Promise.reject(error);
// });

export const createApiClient = () => {
  return apiClient;
};

export abstract class ApiClientWrapper {
  constructor(protected readonly client: AxiosInstance = createApiClient()) {}
}
