import { api } from "../axios"

export async function toggleLike(listingId: string) {
  const res = await api.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/listings/${listingId}/like`,
    {},
    { withCredentials: true }
  )
  return res.data.data as { liked: boolean }
}

// lib/api/listings.ts
export async function getMyListings() {
  const res = await api.get('/api/listings/user/me', { withCredentials: true })
  return res.data.data
}

export async function deleteListing(listingId: string) {
  const res = await api.delete(`/api/listings/${listingId}`, { withCredentials: true })
  return res.data
}