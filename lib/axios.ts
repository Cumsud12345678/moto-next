// lib/axios.ts (client-side, komponentlərdə istifadə üçün)
import axios from 'axios';

export const api = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});