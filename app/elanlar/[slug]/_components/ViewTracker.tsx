'use client'
import { useEffect } from 'react'

// Elan səhifəsi açılanda baxış sayını artırır.
// Backend eyni IP-ni 1 saatda bir dəfə sayır, sahibin öz baxışlarını saymır.
// url verilməsə motosiklet elanı sayılır
export default function ViewTracker({ listingId, url }: { listingId: string, url?: string }) {
  useEffect(() => {
    fetch(url ?? `/api/listings/click/${listingId}`, { method: 'POST', credentials: 'include', keepalive: true })
      .catch(() => {})
  }, [listingId, url])

  return null
}
