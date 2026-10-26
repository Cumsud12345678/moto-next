'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Ən yenilər' },
  { value: 'price_asc', label: 'Əvvəlcə ucuz' },
  { value: 'price_desc', label: 'Əvvəlcə bahalı' },
  { value: 'mileage_asc', label: 'Ən az yürüş' },
  { value: 'year_desc', label: 'Buraxılış ili: yenidən köhnəyə' },
] as const

// Axtarış nəticələrinin sıralaması (?sort=...). Digər filtrlər saxlanılır, səhifə 1-ə qayıdır.
export default function SortSelect({ total }: { total?: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = searchParams.get('sort') || 'newest'

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') params.delete('sort')
    else params.set('sort', value)
    params.delete('page')
    const qs = params.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname))
  }

  return (
    <div className='flex items-center justify-between gap-3 mb-3'>
      <span className='text-gray-500'>
        {total !== undefined && `${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} elan`}
      </span>
      <select
        aria-label='Sıralama'
        value={current}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value)}
        className='rounded-lg border bg-white px-3 py-2 text-[15px] outline-none cursor-pointer disabled:opacity-60'
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
