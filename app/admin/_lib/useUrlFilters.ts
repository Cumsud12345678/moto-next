'use client'
import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Filtrlər URL-də saxlanılır (?q=...&status=...). Səhifəni yeniləyəndə və ya
// linki paylaşanda eyni nəticə açılır. Filtr dəyişəndə səhifə 1-ə qayıdır.
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const values = Object.fromEntries(keys.map((k) => [k, searchParams.get(k) ?? ''])) as Record<K, string>

  const setFilters = useCallback(
    (patch: Partial<Record<K, string>>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(patch) as [K, string | undefined][]) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      params.delete('page')
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams]
  )

  const clearFilters = useCallback(() => router.replace(pathname), [pathname, router])

  const hasFilters = keys.some((k) => values[k])

  // API-yə göndərmək üçün yalnız dolu dəyərlər
  const params = Object.fromEntries(Object.entries(values).filter(([, v]) => v)) as Record<string, string>

  return { values, params, setFilters, clearFilters, hasFilters }
}
