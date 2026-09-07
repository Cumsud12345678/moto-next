import { Default } from "./metadata"

export interface Product {
  _id: number
  price: number
  make: string
  model: string
  year: number
  volume: number
  category: string
  used: string
  color: string
  fuel_type: string
  transmission: string  // suretler qutusu
  power: number  // guc
  mileage: number
  image: string
  city: string
  equipment: Default[]
  phone: string
  createdAt: string
  sellerType: string
  barter: boolean
  document: boolean
  description: string
  role: string
  user: Array<{name: string}>
  isLiked: boolean
}