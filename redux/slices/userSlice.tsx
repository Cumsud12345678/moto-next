import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  name: string
  email: string,
  avatar: string
}

const initialState: UserState = {
  name: 'Cumsud',
  email: 'isayevcumu@gmail.com',
  avatar: 'https://pub-cb8fb86f549343468a5fd508f1ad9a4a.r2.dev/uploads/1788738190149-images.jpg'
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