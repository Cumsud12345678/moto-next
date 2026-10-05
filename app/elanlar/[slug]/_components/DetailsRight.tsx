'use client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toggleLike } from '@/lib/api/listings'
import { toggleGuestLike } from '@/lib/guestLikes'
import { ProductDescription } from '@/types/product'
import { ArrowUpRightFromSquare, Handset, Heart, HeartFill, TriangleExclamation } from '@gravity-ui/icons'
import React, { useState } from 'react'

// interface DetailsRightProps {
//   make: string,
//   model: string,
//   price: number,
//   name: string,
//   city: string,
// }

const DetailsRight = ({ data }: { data: ProductDescription | null }) => {

  const [product, setProduct] = useState<ProductDescription | null>(data)
  const [liked, setLiked] = useState(data?.isLiked)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return // ikiqat klikin qarşısını al
    if (!product) return;

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
          title: `${data?.make.label} ${data?.model.label} - ${data?.price} AZN`,
          text: `${data?.make.label} ${data?.model.label} motosiklet elanı — Motoelan`,
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

  if(!product) {
    return(
      <div>

      </div>
    )
  }

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
              <span className="text-[18px] font-bold">{data?.seller.name}</span>
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
            href={`tel:+994519478134`}
            target="_blank"
            className="my-3 flex items-center gap-2 rounded-lg bg-[#2da562] p-3 text-white cursor-pointer">
            <Handset />
            <h4 className="m-0 p-0 text-xl font-semibold">
              +994 51 947 81 34
            </h4>
          </a>

          <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <TriangleExclamation />
            <AlertTitle>Diqqet</AlertTitle>
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