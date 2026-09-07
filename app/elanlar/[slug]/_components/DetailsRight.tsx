'use client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowUpRightFromSquare, Handset, Heart, HeartFill, TriangleExclamation } from '@gravity-ui/icons'
import React, { useState } from 'react'

interface DetailsRightProps {
  price: number,
  name: string,
  city: string,
}

const DetailsRight = ({price, name, city}: DetailsRightProps) => {

  const [isLiked, setIsLiked] = useState<boolean>(false)

  return (
    <div className="hidden lg:block lg:w-130 min-w-0">
      <div className="sticky top-27 z-[999] mt-3 rounded-lg border bg-[#f5f5f5] shadow-sm w-full h-auto">

        <div className="flex items-center justify-between border-b px-4 py-3">
          <h5 className="text-2xl font-bold">Qiymət</h5>
          <h3 className="text-2xl font-semibold text-red-500">{price} ₼</h3>
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
              <span className="text-[18px] font-bold">{name}</span>
              <span>{city}</span>
            </div>
          </div>

          <div
            className={`my-3 flex flex-row items-center rounded-lg border p-2 cursor-pointer bg-white`}
          >
            {isLiked
              ? <HeartFill className='size-6' />
              : <Heart className='size-6' />
            }
            <span className="mx-2 text-xl font-medium">Bəyən</span>
          </div>

          <div className="my-3 flex flex-row items-center rounded-lg border bg-white p-2 cursor-pointer">
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