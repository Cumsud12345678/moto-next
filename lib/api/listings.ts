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

export async function createVideoUrl() {
  const res = await api.get('/api/listings/create/uploads/video/url', { withCredentials: true })
  return res.data
}

export async function authCreateVideoUrl(listingId: string) {
  const res = await api.get(`/api/listings/create/uploads/video/url/${listingId}`, { withCredentials: true })
  return res.data
}

export async function getListing(listingId: string) {
  const res = await api.get(`/api/listings/${listingId}`, { withCredentials: true })
  return res.data.data
}

export async function updateListing(listingId: string, formData: FormData) {
  const res = await api.put(`api/listings/${listingId}`, formData, {
    withCredentials: true,
    headers: {
      // axios instance-in default 'application/json' header-i FormData ilə toqquşur —
      // boundary-ni brauzerin özü qoya bilsin deyə bunu undefined edirik.
      'Content-Type': undefined,
    },
  })
  return res.data
}
 
