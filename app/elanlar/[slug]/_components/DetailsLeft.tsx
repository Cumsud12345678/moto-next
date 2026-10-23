/* eslint-disable @next/next/no-img-element -- kiçik statik ikonlar */
'use client'
import React, { Fragment, useEffect, useState } from 'react'

import {Handset, HeartFill} from '@gravity-ui/icons';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import {TriangleExclamation} from '@gravity-ui/icons';

import { ChevronLeft, ArrowUpRightFromSquare, Heart, Flag } from '@gravity-ui/icons'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Galery from './Galery'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'
import { ProductDescription } from '@/types/product'
import ReportDialog from '@/components/ReportDialog'
import { phoneLinks, useListingActions } from './useListingActions'

const DetailsLeft = ({ data }: { data: ProductDescription }) => {

  const [scrolled, setScrolled] = useState(false)
  const product = data
  const router = useRouter()
  const { liked, handleLike, handleShare, reportOpen, openReport, setReportOpen } = useListingActions(product)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatNumber = (value: number) => {
    return String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const phone = phoneLinks(product.phone)
  const formattedTelPhone = phone.tel
  const formattedViewPhone = phone.view

  return (
    <div className="w-full overflow-x-hidden">
      <div
        className={`
        fixed top-0 w-full z-50 p-3
        transition-all duration-300 
        block lg:hidden
        ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md border-b text-black'
            : 'bg-linear-to-b from-black/40 to-transparent text-white'
        }
      `}
      >
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()}>
            <ChevronLeft className="size-6" />
          </button>
          <div className="flex gap-3">
            <button onClick={handleLike} aria-label="Bəyən">
              {
                liked
                ? <HeartFill className='size-6 text-red-500' />
                : <Heart className='size-6' />
              }
            </button>
            <button onClick={handleShare} aria-label="Paylaş">
              <ArrowUpRightFromSquare className="size-6" />
            </button>
            <button onClick={openReport} aria-label="Şikayət et">
              <Flag className="size-6" />
            </button>
          </div>
        </div>
      </div>

      <div className='hidden lg:block relative w-full'>
        <Header />

        <div className="fixed top-13 left-0 right-0 z-50">
          <div className="max-w-250 mx-auto p-3 bg-white/90 backdrop-blur-md border-b text-black">
            <div className="flex items-center justify-between">
              <div className='flex items-center gap-2'>
                <button onClick={() => router.back()} aria-label="Geri">
                  <ChevronLeft className="size-7" />
                </button>
                <h3 className='text-xl font-semibold'>{product.make.label} {product.model.label}, {product.volume} sm³, {product.year} il, {product.price} AZN</h3>
              </div>

              <div className="flex gap-3">
                {/* <button onClick={handleLike}>
                  {
                    liked
                    ? <HeartFill className='size-6 text-red-500' />
                    : <Heart className='size-6' />
                  }
                </button> */}
                <button onClick={handleShare} aria-label="Paylaş">
                  <ArrowUpRightFromSquare className="size-6" />
                </button>
                <button onClick={openReport} aria-label="Şikayət et" title="Şikayət et">
                  <Flag className="size-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Galery
        images={product.images}
        video={product.video}
        price={product.price}
        make={product.make.label}
        model={product.model.label}
        volume={product.volume}
        year={product.year}
        phone={product.phone}
      />

      <div className='p-3 bg-white'>
        <p className='text-xl font-semibold'>{formatNumber(product.price)} AZN</p>
        <p className='text-xl'>{product.make.label} {product.model.label}, {product.volume} sm³, {product.year} il, {formatNumber(product.mileage)} km</p>

        <div className='flex flex-row py-3 gap-3 flex-nowrap overflow-auto scrollbar-none'>
          <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
            <img src='/is_new.svg' alt="" className='size-10' />
            <p className='whitespace-nowrap'>Yeni elan</p>
          </div>

          {
            product.barter
            &&
            <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
              <img src='/is_barter.svg' alt="" className='size-10' />
              <p className='whitespace-nowrap'>Barter</p>
            </div>
          }
          
          <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
            <img src='/is_qualified.svg' alt="" className='size-10' />
            <p className='whitespace-nowrap'>Keyfiyyətli elan</p>
          </div>

          {
            product.document
            &&
            <div className='shrink-0 border flex items-center p-2 pr-4 gap-2 bg-gray-200 rounded-xl'>
              <img src='/document-16.svg' alt="" className='size-10' />
              <p className='whitespace-nowrap'>Sənədli</p>
            </div>
          }
          
        </div>

        <div className='border-t my-1 pt-3'>
          <h4 className='text-xl font-semibold'>Xüsusiyyətlər</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-2 text-md mt-3">
            <div className="flex flex-col gap-2 w-full">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Şəhər</span>
                <span>{product.region.label}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Marka</span>
                <span>{product.make.label}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Model</span>
                <span>{product.model.label}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Sürətlər qutusu</span>
                <span>{product.transmission.label}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Rəng</span>
                <span>{product.color.label}</span>
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
                <span>{product.category.label}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Muhərrik</span>
                <span>{product.volume} sm³ / {product.power} a.g. / {product.fuelType.label}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Yürüş</span>
                <span>{formatNumber(product.mileage)} km</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Yeni?</span>
                <span>{product.used ? 'Bəli' : 'Xeyr'}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Barter var?</span>
                <span>{product.barter ? 'Var' : 'Yoxdu'}</span>
              </div>
            </div>

          </div>
        </div>

        <div className='py-3 border-t'>
          <h3 className='text-lg'>Təsvir</h3>
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
              <AvatarImage src="/profile.jpg" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {/* <img className="rounded-full w-[60px] h-[60px] object-contain border-2" src={profile ? `${BASE_URL}/uploads/${profile}` : '/profile.jpg'} alt="" /> */}
            <div className="mx-2 flex flex-col">
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{product.seller.name}</span>
              <span>{product.region.label}</span>
            </div>
          </div>

          <a
            href={`tel:${formattedTelPhone}`}
            target="_blank"
            rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[#2DA562] text-white rounded-lg my-3 gap-2"
          >
            <div className="flex items-center">
              <Handset className='size-5 mr-2' />
              <h5 className="p-0 m-0">{formattedViewPhone}</h5>
            </div>
            <h5 className="m-0">Zəng et</h5>
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

      <div className="fixed bottom-0 w-full p-4 z-50 block lg:hidden">
        <div className="flex gap-3">
          <Fragment>
            <button className="w-full bg-blue-500 rounded-xl text-white shadow">
              <a
                href={`tel:${formattedTelPhone}`}
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
                href={phone.whatsapp}
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

      <ReportDialog listingId={product._id} open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  )
}

export default DetailsLeft