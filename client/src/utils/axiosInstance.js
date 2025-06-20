import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken"); // Retrieve token from localStorage
  console.log("Token being sent:", token);  // 🛑 Debug log
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(config.headers);
  }else {
    console.warn("No token found in localStorage!");
  }
  console.log("Sending request:", config); // Debugging
  return config;
});

export default instance;
