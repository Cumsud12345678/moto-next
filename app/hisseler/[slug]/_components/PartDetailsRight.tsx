'use client'
import { ArrowUpRightFromSquare, Handset, Heart, HeartFill, TriangleExclamation } from '@gravity-ui/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import OwnerActions from '@/app/elanlar/[slug]/_components/OwnerActions'
import { phoneLinks } from '@/app/elanlar/[slug]/_components/useListingActions'
import type { PartDescription } from '@/types/part'
import { usePartActions } from './usePartActions'

const formatNumber = (value: number) => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// Desktop sağ kart — motosiklet elanındakı ilə eyni dizayn
const PartDetailsRight = ({ data }: { data: PartDescription }) => {
  const part = data
  const { liked, handleLike, handleShare } = usePartActions(part)
  const phone = phoneLinks(part.phone)

  return (
    <div className='hidden lg:block lg:w-130 min-w-0'>
      <div className='sticky top-27 z-10 mt-3 rounded-lg border bg-[#f5f5f5] shadow-sm w-full h-auto'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h5 className='text-2xl font-bold'>Qiymət</h5>
          <h3 className='text-2xl font-semibold text-red-500'>{formatNumber(part.price)} ₼</h3>
        </div>

        <div className='p-4'>
          <div className='flex'>
            <Avatar size='lg'>
              <AvatarImage src='/profile.jpg' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='mx-2 flex flex-col'>
              <span className='text-[18px] font-bold'>{part.seller?.name}</span>
              <span>{part.region?.label}</span>
            </div>
          </div>

          <OwnerActions listingId={part._id} sellerId={part.seller?._id} viewCount={part.viewCount} kind='part' className='mt-3' />

          <div onClick={handleLike} className='my-3 flex flex-row items-center rounded-lg border p-2 cursor-pointer bg-white'>
            {liked ? <HeartFill className='size-6 text-red-500' /> : <Heart className='size-6' />}
            <span className='mx-2 text-xl font-medium'>Bəyən</span>
          </div>

          <div onClick={handleShare} className='my-3 flex flex-row items-center rounded-lg border bg-white p-2 cursor-pointer'>
            <ArrowUpRightFromSquare className='size-6' />
            <span className='mx-2 text-xl font-medium'>Paylaş</span>
          </div>

          <a href={`tel:${phone.tel}`} className='my-3 flex items-center gap-2 rounded-lg bg-[#2da562] p-3 text-white cursor-pointer'>
            <Handset />
            <span className='text-xl font-semibold'>{phone.view}</span>
          </a>

          <Alert className='border-amber-200 bg-amber-50 text-amber-900'>
            <TriangleExclamation />
            <AlertTitle>Diqqət</AlertTitle>
            <AlertDescription>Hissəni görmədən öncə beh göndərməyin.</AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}

export default PartDetailsRight
