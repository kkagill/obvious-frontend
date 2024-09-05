import axios from 'axios';

export const clientBackendPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  withCredentials: true,
});

export const clientBackendAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  withCredentials: true,
});