'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Box } from '@gravity-ui/icons'
import { PART_CONDITION_LABEL, PartCard as CardType } from '@/types/part'
import { partPath } from '@/lib/slug'
import PartLikeButton from './PartLikeButton'

export const formatNumber = (value: number) => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// Motosiklet kartı (ProductCard) ilə eyni dizayn
const PartCard = ({ part }: { part: CardType }) => {
  if (!part) return null

  const fits = [part.make?.label, part.model?.label].filter(Boolean).join(' ')

  return (
    <Link
      href={partPath(part.title, part._id)}
      className='rounded-lg overflow-hidden bg-white shadow border-2'
    >
      <div className='relative aspect-4/3 overflow-hidden bg-gray-100'>
        <PartLikeButton partId={part._id} initialLiked={part.isLiked} />

        {part.images?.[0] && (
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${part.images[0]}`}
            alt={part.title}
            fill
            className='object-cover hover:scale-105 transition-transform duration-300'
          />
        )}

        <div className='absolute bottom-0 left-0 z-10 m-2 flex gap-1'>
          <div className={`${part.condition === 'new' ? 'bg-green-500' : 'bg-gray-700/80'} text-white rounded-lg px-1.5 text-[12px]`}>
            {PART_CONDITION_LABEL[part.condition] ?? ''}
          </div>
        </div>

        {part.delivery && (
          <div className='absolute bottom-0 right-0 m-2 z-10'>
            <div className='bg-blue-500 p-1 rounded-full' title='Çatdırılma var'>
              <Box className='text-white' />
            </div>
          </div>
        )}
      </div>

      <div className='p-2'>
        <span className='text-xl text-green-500 font-bold'>{formatNumber(part.price)} ₼</span>
        <p className='text-[16px] truncate'>{part.title}</p>
        <p className='text-[15px] truncate text-gray-600'>{fits || part.partCategory?.label || ' '}</p>
        <p className='text-[14px] text-gray-400 truncate'>{part.region?.label}{part.region?.label ? ', ' : ''}{part.createdAt}</p>
      </div>
    </Link>
  )
}

export default PartCard
