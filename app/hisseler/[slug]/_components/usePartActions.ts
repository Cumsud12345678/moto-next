'use client'
import { useState } from 'react'
import { toast } from '@/components/ui/toast'
import { togglePartLike } from '@/lib/api/parts'
import type { PartDescription } from '@/types/part'

// Bəyən / paylaş — mobil və desktop hissələri eyni məntiqi istifadə edir
export function usePartActions(part: PartDescription) {
  const [liked, setLiked] = useState<boolean>(!!part?.isLiked)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)
    const prev = liked
    setLiked(!prev)
    try {
      const result = await togglePartLike(part._id)
      setLiked(result.liked)
    } catch {
      setLiked(prev)
      toast.add({ type: 'error', description: 'Bəyənmək alınmadı, yenidən cəhd edin' })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${part.title} - ${part.price} AZN`, text: `${part.title} — Motoelan`, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.add({ type: 'success', description: 'Link kopyalandı' })
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') console.error('Share error:', error)
    }
  }

  return { liked, handleLike, handleShare }
}
