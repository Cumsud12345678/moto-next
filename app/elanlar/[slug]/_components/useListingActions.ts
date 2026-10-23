'use client'
import { useState } from 'react'
import { isAxiosError } from 'axios'
import { toast } from '@/components/ui/toast'
import { toggleLike } from '@/lib/api/listings'
import { toggleGuestLike } from '@/lib/guestLikes'
import { ProductDescription } from '@/types/product'

// Bəyən / paylaş / şikayət — DetailsLeft (mobil) və DetailsRight (desktop) eyni məntiqi istifadə edir
export function useListingActions(product: ProductDescription) {
  const [liked, setLiked] = useState<boolean>(!!product?.isLiked)
  const [likeLoading, setLikeLoading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const handleLike = async () => {
    if (likeLoading) return // ikiqat klikin qarşısını al

    setLikeLoading(true)
    const prevLiked = liked
    setLiked(!prevLiked) // optimistic update

    try {
      const result = await toggleLike(product._id)
      setLiked(result.liked) // server-in real cavabı ilə sinxronlaşdır
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        // Qeydiyyatsız istifadəçi — cookie-yə yaz
        setLiked(toggleGuestLike(product._id))
      } else {
        setLiked(prevLiked) // real xəta — geri qaytar
        toast.add({ type: 'error', description: 'Bəyənmək alınmadı, yenidən cəhd edin' })
      }
    } finally {
      setLikeLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${product.make.label} ${product.model.label} - ${product.price} AZN`,
          text: `${product.make.label} ${product.model.label} motosiklet elanı — Motoelan`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        // ƏVVƏL: alert() — brauzerin bloklayan pəncərəsi
        toast.add({ type: 'success', description: 'Link kopyalandı' })
      }
    } catch (error) {
      // İstifadəçi paylaşma pəncərəsini bağlayıbsa
      if ((error as Error).name !== 'AbortError') {
        console.error('Share error:', error)
      }
    }
  }

  return {
    liked,
    handleLike,
    handleShare,
    reportOpen,
    openReport: () => setReportOpen(true),
    setReportOpen,
  }
}

// Telefon: bazada 9 rəqəm saxlanılır (501234567)
export function phoneLinks(phone: number | string) {
  const digits = String(phone ?? '').replace(/\D/g, '').slice(-9)
  const text = 'Salam. motoelan.com-da paylaşdığınız elanla əlaqədar yazıram.'
  return {
    tel: `+994${digits}`,
    view: `+994 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`,
    // ƏVVƏL: wa.me/501234567 — ölkə kodu yox idi, WhatsApp nömrəni tapmırdı; mətn də kodlanmırdı
    whatsapp: `https://wa.me/994${digits}?text=${encodeURIComponent(text)}`,
  }
}
