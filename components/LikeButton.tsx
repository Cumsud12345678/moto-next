'use client'
import { useEffect, useState } from 'react'
import { Heart, HeartFill } from '@gravity-ui/icons'
import { toggleLike } from '@/lib/api/listings'
import { isGuestLiked, toggleGuestLike } from '@/lib/guestLikes'

interface Props {
  listingId: string
  initialLiked: boolean
}

const LikeButton = ({ listingId, initialLiked }: Props) => {
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  // Server login olmayan istifadəçi üçün isLiked=false qaytarır,
  // ona görə mount olanda cookie-ni yoxlayırıq
  useEffect(() => {
    if (!initialLiked && isGuestLiked(listingId)) {
      setLiked(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()   // Link-in default naviqasiyasının qarşısını alır
    e.stopPropagation()  // Event-in valideynə (Link-ə) yayılmasının qarşısını alır

    if (loading) return // ikiqat klikin qarşısını al

    setLoading(true)
    const prevLiked = liked
    setLiked(!prevLiked) // optimistic update

    try {
      const result = await toggleLike(listingId)
      setLiked(result.liked) // server-in real cavabı ilə sinxronlaşdır
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Qeydiyyatsız istifadəçi — cookie-yə yaz
        const newLiked = toggleGuestLike(listingId)
        setLiked(newLiked)
      } else {
        setLiked(prevLiked) // real xəta — geri qaytar
        console.error('Like əməliyyatı uğursuz oldu:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {
        liked
        ? <HeartFill className='absolute top-0 right-0 z-10 size-6 m-2 text-red-600' />
        : <Heart  className='absolute top-0 right-0 z-10 size-6 m-2 text-white' />
      }
    </button>
  )
}

export default LikeButton