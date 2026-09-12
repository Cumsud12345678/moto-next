// lib/axios.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // məs: https://api.example.com
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});