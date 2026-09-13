// components/AuthProvider.tsx
'use client'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import { fetchMe } from '@/redux/slices/userSlice'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  return <>{children}</>
}

export default AuthProvider