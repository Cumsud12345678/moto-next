import { Default } from "./metadata"

export interface ProductCard {
  _id: string
  price: number
  year: number
  volume: number
  mileage: number
  barter: boolean
  credit: boolean
  document: boolean
  images: string[]
  isLiked: boolean
  make: Default
  model: Default
  region: Default
  isUrgent: boolean
  seller: { _id: string, role: string }
}


export interface ProductDescription {
  _id: string
  price: number
  make: Default
  model: Default
  year: number
  volume: number
  category: Default
  used: boolean
  color: Default
  fuelType: Default
  transmission: Default
  power: number
  mileage: number
  images: string[]
  equipment: Default[]
  region: Default
  phone: number
  barter: boolean
  document: boolean
  credit: boolean
  description: string
  seller: { _id: string, role: string, name: string }
  isLiked: boolean
  isUrgent: boolean
}