import { Default } from './metadata'

export type PartCondition = 'new' | 'used'

export const PART_CONDITION_LABEL: Record<PartCondition, string> = {
  new: 'Yeni',
  used: 'İşlənmiş',
}

export interface PartCard {
  _id: string
  title: string
  price: number
  images: string[]
  condition: PartCondition
  delivery?: boolean
  partCategory?: Default
  make?: Default
  model?: Default
  region?: Default
  seller?: { _id: string, role?: string }
  isLiked: boolean
  createdAt: string
  status?: string
  // Yalnız sahibin öz elanlarında gəlir
  viewCount?: number
}

export interface PartDescription extends PartCard {
  phone: number
  description?: string
  seller: { _id: string, role?: string, name: string }
  updatedAt?: string
}

// Düzəliş forması üçün xam elan (relation-lar populate olunmur)
export interface PartRaw {
  _id: string
  title: string
  price: number
  images: string[]
  condition: PartCondition
  delivery?: boolean
  partCategory: string
  make?: string
  model?: string
  region?: string
  phone: number
  description?: string
  status: string
}
