import { api } from '../axios'
import type { PartCard, PartRaw } from '@/types/part'

// FormData göndərəndə boundary-ni brauzer özü qoysun
const multipart = { headers: { 'Content-Type': undefined } }

export async function togglePartLike(partId: string) {
  const res = await api.post(`/api/parts/${partId}/like`, {})
  return res.data.data as { liked: boolean }
}

export async function createPart(formData: FormData) {
  const res = await api.post('/api/parts', formData, multipart)
  return res.data
}

export async function updatePart(partId: string, formData: FormData) {
  const res = await api.put(`/api/parts/${partId}`, formData, multipart)
  return res.data
}

export async function deletePart(partId: string) {
  const res = await api.delete(`/api/parts/${partId}`)
  return res.data
}

export async function getMyParts(): Promise<PartCard[]> {
  const res = await api.get('/api/parts/my')
  return res.data.data ?? []
}

export async function getMyPart(partId: string): Promise<PartRaw> {
  const res = await api.get(`/api/parts/my/${partId}`)
  return res.data.data
}

export async function getLikedParts(): Promise<PartCard[]> {
  const res = await api.get('/api/parts/likes')
  return res.data.data ?? []
}
