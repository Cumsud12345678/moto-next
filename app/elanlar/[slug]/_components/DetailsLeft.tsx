'use client'
import { Product } from '@/types/product'
import Image from 'next/image'
import React, { Fragment, useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'

// Lightbox və lazım olan CSS faylları
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

// Swiper CSS faylları
import 'swiper/css'
import 'swiper/css/navigation'

import {Handset, HeartFill} from '@gravity-ui/icons';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import {TriangleExclamation} from '@gravity-ui/icons';

import { ChevronLeft, ArrowUpRightFromSquare, EllipsisVertical, Xmark, Heart } from '@gravity-ui/icons'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Galery from './Galery'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'

const images = [
  'https://api.motoelan.com/uploads/1788014539354-12553_jqnVAx7zbbVzzxmpTa2nUw.jpg',
  'https://api.motoelan.com/uploads/1788532255563-ChatGPT%20Image%2028%20%C3%90%C2%B0%C3%90%C2%B2%C3%90%C2%B3.%202026%20%C3%90%C2%B3.,%2009_09_38.png',
  'https://api.motoelan.com/uploads/1788532255711-ChatGPT%20Image%2028%20%C3%90%C2%B0%C3%90%C2%B2%C3%90%C2%B3.%202026%20%C3%90%C2%B3.,%2009_08_29.png',
]

const DetailsLeft = ({ data }: { data: Product }) => {

  const [scrolled, setScrolled] = useState(false)
  const [product, setProduct] = useState<Product>(data)
  const router = useRouter()


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handleLike = () => {
    setProduct(prev => ({
      ...prev,
      isLiked: !product.isLiked
    }))
  }

  return (
    <div className="h-500 w-full overflow-x-hidden">
      <div
        className={`
        fixed top-0 w-full z-50 p-3
        transition-all duration-300 
        block lg:hidden
        ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b text-black'
            : 'bg-gradient-to-b from-black/40 to-transparent text-white'
        }
      `}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()}>
            <ChevronLeft className="size-6" />
          </button>
          <div className="flex gap-3">
            <button onClick={() => handleLike()}>
              {
                product.isLiked
                ? <HeartFill className='size-6 text-red-500' />
                : <Heart className='size-6' />
              }
            </button>
            <ArrowUpRightFromSquare className="size-6" />
            <EllipsisVertical className="size-6" />
          </div>
        </div>
      </div>

      <div className='hidden lg:block relative w-full'>
        <Header />

        <div className="fixed top-12 left-0 right-0 z-50">
          <div className="max-w-250 mx-auto p-3 bg-white/90 backdrop-blur-md border-b text-black">
            <div className="flex items-center justify-between">
              <div className='flex items-center gap-2'>
                <ChevronLeft className="size-7" />
                <h3 className='text-xl font-semibold'>{product.make} {product.model}, {product.volume} sm³, {product.year} il, {product.price} AZN</h3>
              </div>

              <div className="flex gap-3">
                <button>
                  <Heart className='size-6' />
                </button>
                <button>
                  <ArrowUpRightFromSquare className="size-6" />
                </button>
                <button>
                  <EllipsisVertical className="size-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Galery 
        images={images}
        price={product.price}
        make={product.make}
        model={product.model}
        volume={product.volume}
        year={product.year}
      />

      <div className='p-3 bg-white'>
        <p className='text-xl font-semibold'>{formatNumber(product.price)} AZN</p>
        <p className='text-xl'>{product.make} {product.model}, {product.volume} sm³, {product.year} il, {formatNumber(product.mileage)} km</p>

        <div className='flex flex-row py-3 gap-3 flex-nowrap overflow-auto scrollbar-none'>
          <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
            <img src='/is_new.svg' alt="" className='size-10' />
            <p className='whitespace-nowrap'>Yeni elan</p>
          </div>

          <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
            <img src='/is_barter.svg' alt="" className='size-10' />
            <p className='whitespace-nowrap'>Barter</p>
          </div>

          <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
            <img src='/is_qualified.svg' alt="" className='size-10' />
            <p className='whitespace-nowrap'>Keyfiyyetli elan</p>
          </div>

          <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
            <img src='/document-16.svg' alt="" className='size-10' />
            <p className='whitespace-nowrap'>Senedli</p>
          </div>

        </div>

        <div className='border-t my-1 pt-3'>
          <h4 className='text-xl font-semibold'>Xusiyyetler</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-2 text-md mt-3">
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Şəhər</span>
                <span>{product.city}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Marka</span>
                <span>{product.make}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Model</span>
                <span>{product.model}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Sürətlər qutusu</span>
                <span>{product.transmission}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Rəng</span>
                <span>{product.color}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Qiymət</span>
                <span>{formatNumber(product.price)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Buraxılış ili</span>
                <span>{product.year}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Ban növü</span>
                <span>{product.category}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Muhərrik</span>
                <span>{product.volume} sm³ / {product.power} a.g. / {product.fuel_type}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Yürüş</span>
                <span>{formatNumber(product.mileage)} km</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Yeni?</span>
                <span>{product.used}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Barter var?</span>
                <span>{product.barter ? 'Var' : 'Yoxdu'}</span>
              </div>
            </div>

          </div>
        </div>

        <div className='py-3 border-t'>
          <h3 className='text-xl'>Tesvir</h3>
          <p className='mt-2'>{product.description}</p>
        </div>

        {
          product.equipment.length !== 0 &&
          <div className="flex flex-wrap gap-2 border-y py-3 lg:px-0">
            {
              product.equipment.map(equipment => (
                <button className="p-2 px-3 rounded-2x bg-[#ebedf3] rounded-full text-md" key={equipment._id}>{equipment.label}</button>
              ))
            }
          </div>
        }

        <div className="lg:hidden border-b py-3">
          <div className="flex p-2 rounded-lg items-center bg-[#f5f5f5]">
            <Avatar size='lg'>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {/* <img className="rounded-full w-[60px] h-[60px] object-contain border-2" src={profile ? `${BASE_URL}/uploads/${profile}` : '/profile.jpg'} alt="" /> */}
            <div className="mx-2 flex flex-col">
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{product.user[0].name}</span>
              <span>{product.city}</span>
            </div>
          </div>

          <a
            href={`tel:+994519478134`}
            target="_blank"
            rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#2DA562] text-white rounded-lg my-3 gap-2"
          >
            <div className="flex items-center">
              <Handset className='size-5 mr-2' />
              <h5 className="p-0 m-0">+994 51 947 81 34</h5>
            </div>
            <h5 className="m-0">Zəng et</h5>
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

      <div className="fixed bottom-0 w-full p-4 z-50 block lg:hidden">
        <div className="flex gap-3">
          <Fragment>
            <button className="w-full bg-blue-500 rounded-xl text-white shadow">
              <a
                href={`tel:+994519478134`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full flex items-center justify-center p-3"
              >
                <Handset className='size-6 mr-2' />
                <span className="text-white font-bold">Zəng et</span>
              </a>
            </button>

            <button className="w-full bg-[#2DA562] rounded-xl text-white shadow">
              <a
                href={`https://wa.me/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full flex items-center justify-center p-3"
              >
                <img src="/whatsapp.svg" alt="" className='size-6 mr-2' />
                WhatsApp
              </a>
            </button>
          </Fragment>
        </div>
      </div>

    </div>
  )
}

export default DetailsLeft