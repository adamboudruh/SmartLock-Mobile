import axios from 'axios';

// axios instance with the base url of backend server
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.0.49:3000',
});

export default api;