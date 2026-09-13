// _components/BookmarkList.tsx
'use client'
import { useState } from 'react'
import ProductCard from './ProductCard'
import { ProductCard as CardType } from '@/types/product'

const BookmarkList = ({ initialData }: { initialData: CardType[] }) => {
  const [products, setProducts] = useState<CardType[]>(initialData)

  const handleUnlike = (listingId: string) => {
    setProducts((prev) => prev.filter((item) => item._id !== listingId))
  }

  if (products.length === 0) {
    return <div className='text-center text-gray-400 py-10'>Hələ heç bir elanı bəyənməmisiniz.</div>
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 align-items-center'>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onUnlike={handleUnlike} />
      ))}
    </div>
  )
}

export default BookmarkList