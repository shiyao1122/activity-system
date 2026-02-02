import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL + '/admin', // Adjust if needed
});


export const clientApi = axios.create({
    baseURL: API_URL + '/v1',
});

export default api;
