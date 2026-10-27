/* eslint-disable @next/next/no-img-element -- kiçik statik ikon */
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRightFromSquare, ChevronLeft, Handset, Heart, HeartFill, TriangleExclamation } from '@gravity-ui/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Header from '@/components/Header'
import Galery from '@/app/elanlar/[slug]/_components/Galery'
import OwnerActions from '@/app/elanlar/[slug]/_components/OwnerActions'
import { phoneLinks } from '@/app/elanlar/[slug]/_components/useListingActions'
import { PART_CONDITION_LABEL, PartDescription } from '@/types/part'
import { usePartActions } from './usePartActions'

const formatNumber = (value: number) => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const Row = ({ label, value }: { label: string, value?: string }) =>
  value ? (
    <div className='grid grid-cols-2'>
      <span className='text-gray-500'>{label}</span>
      <span>{value}</span>
    </div>
  ) : null

const PartDetailsLeft = ({ data }: { data: PartDescription }) => {
  const part = data
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const { liked, handleLike, handleShare } = usePartActions(part)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const phone = phoneLinks(part.phone)
  const fits = [part.make?.label, part.model?.label].filter(Boolean).join(' ')

  return (
    <div className='w-full overflow-x-hidden'>
      {/* Mobil üst panel */}
      <div
        className={`fixed top-0 w-full z-50 p-3 transition-all duration-300 block lg:hidden ${
          scrolled ? 'bg-white/90 backdrop-blur-md border-b text-black' : 'bg-linear-to-b from-black/40 to-transparent text-white'
        }`}
      >
        <div className='flex items-center justify-between'>
          <button onClick={() => router.back()} aria-label='Geri'>
            <ChevronLeft className='size-6' />
          </button>
          <div className='flex gap-3'>
            <button onClick={handleLike} aria-label='Bəyən'>
              {liked ? <HeartFill className='size-6 text-red-500' /> : <Heart className='size-6' />}
            </button>
            <button onClick={handleShare} aria-label='Paylaş'>
              <ArrowUpRightFromSquare className='size-6' />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop üst panel */}
      <div className='hidden lg:block relative w-full'>
        <Header />
        <div className='fixed top-13 left-0 right-0 z-50'>
          <div className='max-w-250 mx-auto p-3 bg-white/90 backdrop-blur-md border-b text-black'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 min-w-0'>
                <button onClick={() => router.back()} aria-label='Geri'>
                  <ChevronLeft className='size-7' />
                </button>
                <h1 className='text-xl font-semibold truncate'>{part.title}, {formatNumber(part.price)} AZN</h1>
              </div>
              <button onClick={handleShare} aria-label='Paylaş'>
                <ArrowUpRightFromSquare className='size-6' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Galery
        images={part.images}
        video={undefined}
        price={part.price}
        make={part.title}
        model=''
        volume={0}
        year={0}
        phone={part.phone}
        subtitle={part.title}
      />

      <div className='p-3 bg-white'>
        <p className='text-xl font-semibold'>{formatNumber(part.price)} AZN</p>
        <p className='text-xl lg:hidden'>{part.title}</p>

        <OwnerActions listingId={part._id} sellerId={part.seller?._id} viewCount={part.viewCount} kind='part' className='mt-3 lg:hidden' />

        <div className='flex flex-row py-3 gap-3 flex-nowrap overflow-auto scrollbar-none'>
          <div className='shrink-0 border flex items-center p-2 px-4 gap-2 bg-gray-200 rounded-xl'>
            <p className='whitespace-nowrap'>{PART_CONDITION_LABEL[part.condition]}</p>
          </div>
          {part.partCategory?.label && (
            <div className='shrink-0 border flex items-center p-2 px-4 gap-2 bg-gray-200 rounded-xl'>
              <p className='whitespace-nowrap'>{part.partCategory.label}</p>
            </div>
          )}
          {part.delivery && (
            <div className='shrink-0 border flex items-center p-2 px-4 gap-2 bg-gray-200 rounded-xl'>
              <p className='whitespace-nowrap'>Çatdırılma var</p>
            </div>
          )}
        </div>

        <div className='border-t my-1 pt-3'>
          <h4 className='text-xl font-semibold'>Xüsusiyyətlər</h4>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 text-md mt-3'>
            <Row label='Kateqoriya' value={part.partCategory?.label} />
            <Row label='Vəziyyəti' value={PART_CONDITION_LABEL[part.condition]} />
            <Row label='Uyğun marka' value={part.make?.label} />
            <Row label='Uyğun model' value={part.model?.label} />
            <Row label='Şəhər' value={part.region?.label} />
            <Row label='Çatdırılma' value={part.delivery ? 'Var' : 'Yoxdur'} />
            <Row label='Qiymət' value={`${formatNumber(part.price)} AZN`} />
            <Row label='Elan tarixi' value={part.createdAt} />
          </div>
          {!fits && (
            <p className='text-sm text-gray-500 mt-2'>Satıcı uyğun markanı qeyd etməyib — dəqiqləşdirmək üçün əlaqə saxlayın.</p>
          )}
        </div>

        {part.description && (
          <div className='py-3 border-t'>
            <h3 className='text-lg'>Təsvir</h3>
            <p className='mt-2 whitespace-pre-line wrap-break-word'>{part.description}</p>
          </div>
        )}

        <div className='lg:hidden border-y py-3'>
          <div className='flex p-2 rounded-lg items-center bg-[#f5f5f5]'>
            <Avatar size='lg'>
              <AvatarImage src='/profile.jpg' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='mx-2 flex flex-col'>
              <span className='text-[18px] font-bold'>{part.seller?.name}</span>
              <span>{part.region?.label}</span>
            </div>
          </div>

          <a href={`tel:${phone.tel}`} className='flex items-center justify-between p-3 bg-[#2DA562] text-white rounded-lg my-3 gap-2'>
            <div className='flex items-center'>
              <Handset className='size-5 mr-2' />
              <span>{phone.view}</span>
            </div>
            <span>Zəng et</span>
          </a>

          <Alert className='border-amber-200 bg-amber-50 text-amber-900'>
            <TriangleExclamation />
            <AlertTitle>Diqqət</AlertTitle>
            <AlertDescription>Hissəni görmədən öncə beh göndərməyin.</AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Mobil alt düymələr */}
      <div className='fixed bottom-0 w-full p-4 z-50 block lg:hidden'>
        <div className='flex gap-3'>
          <a href={`tel:${phone.tel}`} className='w-full bg-blue-500 rounded-xl text-white shadow flex items-center justify-center p-3'>
            <Handset className='size-6 mr-2' />
            <span className='font-bold'>Zəng et</span>
          </a>
          <a href={phone.whatsapp} target='_blank' rel='noopener noreferrer' className='w-full bg-[#2DA562] rounded-xl text-white shadow flex items-center justify-center p-3'>
            <img src='/whatsapp.svg' alt='' className='size-6 mr-2' />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default PartDetailsLeft
