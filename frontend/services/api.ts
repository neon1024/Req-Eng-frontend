import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Base URL - change this to your backend server URL
const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - could trigger logout here
            AsyncStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH API ====================

export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get("/auth/profile");
        return response.data;
    },
};

// ==================== MOODS API ====================

export const moodsAPI = {
    getConfig: async () => {
        const response = await api.get("/moods/config");
        return response.data;
    },

    getAll: async () => {
        console.log('[API] GET /moods');
        const response = await api.get("/moods");
        console.log('[API] GET /moods response:', response.status, response.data);
        return response.data;
    },

    add: async (rate: number) => {
        console.log('[API] POST /moods', { rate });
        const response = await api.post("/moods", { rate });
        console.log('[API] POST /moods response:', response.status, response.data);
        return response.data;
    },

    update: async (rate: number) => {
        console.log('[API] PUT /moods', { rate });
        const response = await api.put("/moods", { rate });
        console.log('[API] PUT /moods response:', response.status, response.data);
        return response.data;
    },

    remove: async () => {
        console.log('[API] DELETE /moods');
        const response = await api.delete("/moods");
        console.log('[API] DELETE /moods response:', response.status, response.data);
        return response.data;
    },
};

// ==================== DOCTOR API ====================

export const doctorAPI = {
    getPatients: async () => {
        const response = await api.get("/doctor/patients");
        return response.data;
    },

    assignPatient: async (patientId: string) => {
        const response = await api.post(`/doctor/patients/${patientId}/assign`);
        return response.data;
    },

    unassignPatient: async (patientId: string) => {
        const response = await api.delete(`/doctor/patients/${patientId}/assign`);
        return response.data;
    },

    getPatientMoods: async (patientId: string) => {
        const response = await api.get(`/doctor/patients/${patientId}/moods`);
        return response.data;
    },
};

// ==================== HEALTH API ====================

export const healthAPI = {
    check: async () => {
        const response = await api.get("/health");
        return response.data;
    },
};

export default api;
