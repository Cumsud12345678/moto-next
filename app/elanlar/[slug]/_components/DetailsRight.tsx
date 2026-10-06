'use client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toggleLike } from '@/lib/api/listings'
import { toggleGuestLike } from '@/lib/guestLikes'
import { ProductDescription } from '@/types/product'
import { ArrowUpRightFromSquare, Handset, Heart, HeartFill, TriangleExclamation } from '@gravity-ui/icons'
import React, { useState } from 'react'

const DetailsRight = ({ data }: { data: ProductDescription }) => {

  const [product, setProduct] = useState<ProductDescription>(data)
  const [liked, setLiked] = useState(data.isLiked)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return // ikiqat klikin qarşısını al

    setLoading(true)
    const prevLiked = liked
    setLiked(!prevLiked) // optimistic update

    try {
      const result = await toggleLike(product._id)
      setLiked(result.liked) // server-in real cavabı ilə sinxronlaşdır
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Qeydiyyatsız istifadəçi — cookie-yə yaz
        const newLiked = toggleGuestLike(product._id)
        setLiked(newLiked)
      } else {
        setLiked(prevLiked) // real xəta — geri qaytar
        console.error('Like əməliyyatı uğursuz oldu:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${product.make.label} ${product.model.label} - ${product.price} AZN`,
          text: `${product.make.label} ${product.model.label} motosiklet elanı — Motoelan`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link kopyalandı");
      }
    } catch (error) {
      // İstifadəçi paylaşma pəncərəsini bağlayıbsa
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error);
      }
    }
  };

  const formattedTelPhone = `+994${product.phone}`
  const formattedViewPhone = `+994 ${String(product.phone).slice(0, 2)} ${String(product.phone).slice(2, 5)} ${String(product.phone).slice(5, 7)} ${String(product.phone).slice(7, 9)}`

  return (
    <div className="hidden lg:block lg:w-130 min-w-0">
      <div className="sticky top-27 z-10 mt-3 rounded-lg border bg-[#f5f5f5] shadow-sm w-full h-auto">

        <div className="flex items-center justify-between border-b px-4 py-3">
          <h5 className="text-2xl font-bold">Qiymət</h5>
          <h3 className="text-2xl font-semibold text-red-500">{product.price} ₼</h3>
        </div>

        <div className="p-4">
          <div className="flex">
            <Avatar size='lg'>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {/* <img
              src={profile ? `${BASE_URL}/uploads/${profile}` : '/profile.jpg'}
              alt="profile"
              className="h-[60px] w-[60px] rounded-full object-contain border-2"
            /> */}

            <div className="mx-2 flex flex-col">
              <span className="text-[18px] font-bold">{product.seller.name}</span>
              <span>{product.region.label}</span>
            </div>
          </div>

          <div
            onClick={handleLike}
            className={`my-3 flex flex-row items-center rounded-lg border p-2 cursor-pointer bg-white`}
          >
            {
            liked
            ? <HeartFill className='size-6 text-red-500' />
            : <Heart className='size-6' />
            }
            <span className="mx-2 text-xl font-medium">Bəyən</span>
          </div>

          <div onClick={handleShare} className="my-3 flex flex-row items-center rounded-lg border bg-white p-2 cursor-pointer">
            <ArrowUpRightFromSquare className='size-6' />
            <span className="mx-2 text-xl font-medium">Paylaş</span>
          </div>

          {/* <div className="my-3 flex flex-row items-center rounded-lg border p-2">
            <OutlinedFlagIcon sx={{ fontSize: "30px" }} />
            <span className="mx-2 text-xl font-medium">Şikayət et</span>
          </div> */}

          <a
            href={`tel:${formattedTelPhone}`}
            target="_blank"
            className="my-3 flex items-center gap-2 rounded-lg bg-[#2da562] p-3 text-white cursor-pointer">
            <Handset />
            <h4 className="m-0 p-0 text-xl font-semibold">
              {formattedViewPhone}
            </h4>
          </a>

          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <TriangleExclamation />
            <AlertTitle>Diqqət</AlertTitle>
            <AlertDescription className=''>
              Motosikletə baxış keçirmədən öncə beh göndərməyin.
            </AlertDescription>
          </Alert>
        </div>

      </div>
    </div>
  )
}

export default DetailsRight