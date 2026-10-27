'use client'
import { useState } from 'react'
import { Heart, HeartFill } from '@gravity-ui/icons'
import { togglePartLike } from '@/lib/api/parts'

// Hissə kartındakı ürək. Qonaq bəyənmələrini backend cookie-də saxlayır.
const PartLikeButton = ({ partId, initialLiked }: { partId: string, initialLiked: boolean }) => {
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return

    setLoading(true)
    const prev = liked
    setLiked(!prev)
    try {
      const result = await togglePartLike(partId)
      setLiked(result.liked)
    } catch {
      setLiked(prev)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} aria-label='Bəyən'>
      {
        liked
        ? <HeartFill className='absolute top-0 right-0 z-10 size-6 m-2 text-red-600' />
        : <Heart className='absolute top-0 right-0 z-10 size-6 m-2 text-white drop-shadow' />
      }
    </button>
  )
}

export default PartLikeButton
