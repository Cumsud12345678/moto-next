// lib/axios.ts (client-side, komponentlərdə istifadə üçün)
import axios from 'axios';

export const api = axios.create({
  // Render-də backend yuxudan oyananda 10 san. çatmırdı: sorğu düşür,
  // istifadəçi "giriş etməmiş" sayılırdı. 30 san. daha təhlükəsizdir.
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});