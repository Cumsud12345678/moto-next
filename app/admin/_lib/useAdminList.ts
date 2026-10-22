'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Paginated } from './utils'

// Admin cədvəlləri üçün səhifələnmiş siyahı. Səhifə dəyişəndə köhnə data qalır,
// cədvəl "tullanmır".
export function useAdminList<T>(endpoint: string, page: number, limit = 20, params: Record<string, string> = {}) {
  return useQuery<Paginated<T>>({
    queryKey: ['admin', endpoint, page, limit, params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<T>>(endpoint, { params: { page, limit, ...params } })
      return data
    },
    placeholderData: keepPreviousData,
  })
}
