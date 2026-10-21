// lib/axios-server.ts (yalnız server komponentlərdə, page.tsx-lərdə istifadə üçün)
import axios from 'axios';

export const serverApi = axios.create({
  baseURL: process.env.API_URL, // NEXT_PUBLIC_ yox — server-only env variable, real backend URL-i
  // Render backend-i yuxudan oyananda 10 san. çatmır
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});