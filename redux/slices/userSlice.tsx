import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  name: string
  email: string,
  avatar: string
}

const initialState: UserState = {
  name: 'Cumsud',
  email: 'isayevcumu@gmail.com',
  avatar: 'https://api.motoelan.com/uploads/1787732761034-Screenshot_20240923_235946_com.whatsapp.jpg'
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.name = action.payload.name
      state.email = action.payload.email
    },

    clearUser: (state) => {
      state.name = ''
      state.email = ''
    },
  },
})

export const { setUser, clearUser } = userSlice.actions

export default userSlice.reducer