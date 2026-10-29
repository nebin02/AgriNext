import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") || "http://localhost:3000"
});

export default api;
