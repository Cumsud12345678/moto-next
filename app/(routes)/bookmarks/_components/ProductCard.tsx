'use client'
import { Heart, HeartFill, ArrowsRotateLeft, FileText } from '@gravity-ui/icons'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link';
import { ProductCard as CardType } from '@/types/product';
import { toggleLike } from '@/lib/api/listings';

interface Props {
  product: CardType
  onUnlike?: (listingId: string) => void   // bookmarks səhifəsi üçün
}

const ProductCard = ({ product, onUnlike }: Props) => {
  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)  // çıxış animasiyası üçün (ixtiyari)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (loading) return
    setLoading(true)

    try {
      const result = await toggleLike(product._id)

      // əgər unlike olubsa VƏ bu, bookmarks səhifəsidirsə (onUnlike verilibsə) → siyahıdan çıxar
      if (!result.liked && onUnlike) {
        setRemoving(true)
        setTimeout(() => onUnlike(product._id), 200) // kiçik fade-out gözləmək istəsən
      }
    } catch (err) {
      console.error('Like əməliyyatı uğursuz oldu:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!product) return null

  return (
    <Link
      href={`/elanlar/${product.make.label}-${product.model.label}-${product._id}`}
      className={`rounded-lg overflow-hidden bg-white shadow border-2 transition-opacity duration-200 ${
        product.isUrgent ? "border-orange-400" : ""
      } ${removing ? 'opacity-0 scale-95' : 'opacity-100'}`}
    >
      <div className='relative aspect-4/3 overflow-hidden'>
        {product.isUrgent && (
          <div className='absolute p-0.5 px-1.5 bg-orange-400 text-white top-0 left-0 z-40 rounded-br-lg overflow-hidden shine-effect text-sm'>
            Tecili satilir
          </div>
        )}

        <button onClick={handleClick} disabled={loading}>
          <HeartFill className='absolute top-0 right-0 z-10 size-6 m-2 text-red-600' />
        </button>

        <Image src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.images[0]}`} alt='' fill className='object-cover hover:scale-105 transition-transform duration-300' />

        <div className='absolute bottom-0 right-0 m-2 flex gap-1 z-10'>
          {product.barter && (
            <div className='bg-green-500 p-1.5 rounded-full z-10'>
              <ArrowsRotateLeft className='text-white' />
            </div>
          )}
          {product.document && (
            <div className='bg-blue-500 p-1.5 rounded-full'>
              <FileText className='text-white' />
            </div>
          )}
        </div>

        {product.seller.role === "seller" && (
          <div className='absolute bottom-0 left-0 z-10 m-2 flex gap-1'>
            <div className='bg-blue-500 text-white rounded-lg px-1.5 text-[12px]'>Resmi</div>
          </div>
        )}
      </div>

      <div className={`p-2 relative overflow-hidden ${product.isUrgent && 'shine-effect'}`}>
        <div>
          <span className="text-xl text-green-500 font-bold">
            {formatNumber(product.price)} ₼
          </span>
        </div>
        <p className='font-semibold text-[16px]'>{product.make.label} {product.model.label}</p>
        <p className='truncate text-[15px]'>{product.year}, {product.volume} sm³, {formatNumber(product.mileage)}</p>
        <p className='text-[14px] text-gray-400 truncate'>{product.region.label}, Bu gun</p>
      </div>
    </Link>
  )
}

export default ProductCard