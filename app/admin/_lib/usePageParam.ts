'use client'
import { useSearchParams } from 'next/navigation'

// URL-dəki ?page=2 dəyəri (ListingPagination ilə birlikdə işləyir)
export function usePageParam() {
  const searchParams = useSearchParams()
  return Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1)
}
