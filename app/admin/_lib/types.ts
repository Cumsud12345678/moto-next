import type { Default } from '@/types/metadata'

export type UserRole = 'user' | 'seller' | 'service' | 'admin'

export interface AdminUser {
  _id: string
  name: string
  email: string
  ip?: string
  avatar?: string
  role: UserRole
  isWarning: number
  isLocked: boolean
  lockedAt?: string | null
  listingCount?: number
  createdAt?: string
}

export type ListingStatus = 'pending' | 'active' | 'sold' | 'expired' | 'rejected' | 'blocked'

export interface AdminListing {
  _id: string
  price: number
  make: Default
  model: Default
  year: number
  volume: number
  category?: Default
  used: boolean
  color?: Default
  fuelType?: Default
  transmission?: Default
  power: number
  mileage: number
  images: string[]
  equipment: Default[]
  region?: Default
  phone: number
  barter: boolean
  document: boolean
  credit: boolean
  description: string
  video?: string
  seller: { _id: string; role: string; name: string; email: string } | null
  viewCount?: number
  likedCount?: number
  status: ListingStatus
  isUrgent: boolean
  urgentActiveAt?: string
  urgentExpiresAt?: string
  createdAt?: string
  updatedAt?: string
}

export const MAX_WARNINGS = 5
