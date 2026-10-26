'use client'
import { useEffect } from 'react'

// Elan səhifəsi açılanda baxış sayını artırır.
// Backend eyni IP-ni 1 saatda bir dəfə sayır, sahibin öz baxışlarını saymır.
export default function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    fetch(`/api/listings/click/${listingId}`, { method: 'POST', credentials: 'include', keepalive: true })
      .catch(() => {})
  }, [listingId])

  return null
}
