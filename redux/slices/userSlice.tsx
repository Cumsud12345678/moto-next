// redux/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean // ilk fetch bitibmi, bilmək üçün
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
}

export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
  const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, { withCredentials: true })
  return res.data.data // undefined ola bilər (login olmayıbsa)
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
    },
    setUser: (state, action) => {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload ?? null
        state.loading = false
        state.initialized = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
        state.loading = false
        state.initialized = true
      })
  }
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer