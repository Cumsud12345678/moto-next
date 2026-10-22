// Admin paneldə hər yerdə eyni formatda göstərmək üçün köməkçilər

export const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''

export const imageSrc = (key?: string | null) => (key ? `${IMAGE_URL}/${key}` : '/empty.png')

const dateFmt = new Intl.DateTimeFormat('az-AZ', {
  timeZone: 'Asia/Baku',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('az-AZ', {
  timeZone: 'Asia/Baku',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const isValidDate = (d: Date) => !Number.isNaN(d.getTime())

export const formatDate = (value?: string | Date | null) => {
  if (!value) return '—'
  const d = new Date(value)
  return isValidDate(d) ? dateFmt.format(d) : '—'
}

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '—'
  const d = new Date(value)
  return isValidDate(d) ? dateTimeFmt.format(d) : '—'
}

export const formatNumber = (value?: number | null) =>
  typeof value === 'number' ? value.toLocaleString('az-AZ') : '—'

export const formatPrice = (value?: number | null) =>
  typeof value === 'number' ? `${value.toLocaleString('az-AZ')} AZN` : '—'

// "3 gün qalıb" / "2 gün əvvəl bitib"
export const daysLeft = (value?: string | null) => {
  if (!value) return null
  const diff = new Date(value).getTime() - Date.now()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

// Axios xətasından backend-in mesajını götürür
export const errorMessage = (err: unknown, fallback = 'Xəta baş verdi') =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

// Extra: bəzi endpoint-lərin əlavə sahələri (məs. pendingCount)
export type Paginated<T, Extra = object> = {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} & Extra
