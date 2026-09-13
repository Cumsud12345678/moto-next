'use client'
import { useState } from 'react'
import { Heart, HeartFill } from '@gravity-ui/icons'
import { toggleLike } from '@/lib/api/listings'

interface Props {
  listingId: string
  initialLiked: boolean
}

const LikeButton = ({ listingId, initialLiked }: Props) => {
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()   // Link-in default naviqasiyasının qarşısını alır
    e.stopPropagation()  // Event-in valideynə (Link-ə) yayılmasının qarşısını alır

    if (loading) return // ikiqat klikin qarşısını al

    setLoading(true)
    const prevLiked = liked
    setLiked(!prevLiked) // optimistic update

    try {
      const result = await toggleLike(listingId)
      console.log(result.liked)
      setLiked(result.liked) // server-in real cavabı ilə sinxronlaşdır
    } catch (err) {
      setLiked(prevLiked) // xəta olsa geri qaytar
      console.error('Like əməliyyatı uğursuz oldu:', err)
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