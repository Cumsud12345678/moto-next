// redux/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/axios'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean // ilk fetch bitibmi, bilmək üçün
  error: boolean // /me sorğusu ŞƏBƏKƏ/SERVER xətası ilə düşdü (bu "login olmayıb" demək DEYİL)
}

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false,
  error: false,
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Əvvəl /me bir dəfə düşəndə (timeout, server yuxudadır və s.) user=null olurdu
// və profil səhifəsi istifadəçini /auth-a atırdı — cookie etibarlı olsa belə.
// İndi 3 dəfə yoxlayırıq və yalnız server "login yoxdur" desə user=null edirik.
export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await api.get(`/api/auth/me`, { withCredentials: true })
      return res.data.data // undefined ola bilər (login olmayıbsa)
    } catch (err) {
      lastErr = err
      if (attempt < 2) await sleep(1500 * (attempt + 1))
    }
  }
  throw lastErr
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
      state.loading = false
      state.initialized = true
      state.error = false
    },
    decGiftCount: (state) => {
      if(!state.user) return;
      state.user.giftPremiumCount = state.user.giftPremiumCount - 1
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
        state.error = false
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload ?? null
        state.loading = false
        state.initialized = true
        state.error = false
      })
      .addCase(fetchMe.rejected, (state) => {
        // user-i SİLMİRİK: əvvəlcədən setUser ilə yazılıbsa qalsın
        state.loading = false
        state.initialized = true
        state.error = true
      })
  }
})

export const { logout, setUser, decGiftCount } = authSlice.actions
export default authSlice.reducer