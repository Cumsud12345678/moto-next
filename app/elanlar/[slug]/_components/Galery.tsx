'use client'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'

// Lightbox və lazım olan CSS faylları
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

// Swiper CSS faylları
import 'swiper/css'
import 'swiper/css/navigation'

import {Handset} from '@gravity-ui/icons';

import { Xmark, Heart } from '@gravity-ui/icons'

interface GaleryProps {
  images: Array<string>
  price: number
  make: string
  model: string
  volume: number
  year: number
}

const Galery = ({images, price, make, model, volume, year}: GaleryProps) => {

  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)
  const [imageCount, setImageCount] = useState<number>(1)

  const [open, setOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const [gridOpen, setGridOpen] = useState(false)

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index)
    setOpen(true)
  }

  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  useEffect(() => {
    if(gridOpen) {
      document.body.style.overflow = 'hidden';
    }else {
      document.body.style.overflow = '';
    }
  }, [gridOpen])

  console.log("IMAGE URL:", process.env.NEXT_PUBLIC_IMAGE_URL)
console.log("IMAGES:", images)

  return (
    <Fragment>
      <Swiper
        className="w-full h-75 lg:h-106 overflow-hidden lg:mt-23"
        onSlideChange={(swiper) => setImageCount(swiper.realIndex + 1)}
        modules={[Thumbs, Navigation]}
        thumbs={{ swiper: thumbsSwiper }}
        navigation
        loop
      >
        <div className="absolute z-10 bg-black text-white p-1 px-2 rounded-lg left-0 bottom-0 m-3 text-sm bg-black/30">
          {imageCount} / {images.length}
        </div>
        <div
          onClick={() => setGridOpen(true)}
          className="absolute z-10 bg-black text-white p-1 px-2 rounded-lg right-0 bottom-0 m-3 text-sm cursor-pointer block lg:hidden"
        >
          Bütün şəkillər
        </div>

        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full h-85 lg:h-115 overflow-hidden rounded-md cursor-pointer"
              onClick={() => handleOpenLightbox(index)}
            >
              {/* Arxa fon - bulanıq */}
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${image}`}
                alt=""
                aria-hidden="true"
                fill
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70 hidden lg:block"
              />

              {/* Ön plan - əsl şəkil */}
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${image}`}
                alt=""
                fill
                className="absolute w-full h-full object-contain hidden lg:block top-1/2 left-1/2 -transform-y-1/2 -transform-x-1/2"
              />
              
              <div
                className="
                  w-full
                  h-[330px]
                  bg-center
                  bg-cover
                  bg-no-repeat
                  lg:hidden
                "
                style={{
                  backgroundImage: `url(${process.env.NEXT_PUBLIC_IMAGE_URL}/${image})`,
                }}
              />

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail-lar */}
      <div className="p-3 border-b hidden lg:block">
        <Swiper
          onSwiper={setThumbsSwiper}
          modules={[Thumbs]}
          slidesPerView={9}
          spaceBetween={10}
          className="w-177 h-13"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${image}`}
                alt=""
                fill
                className="object-contain bg-black rounded-lg cursor-pointer"
                onClick={() => handleOpenLightbox(index)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Bütün şəkillər - 2 sütunlu qalereya görünüşü */}
      {gridOpen && (
        <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm text-white">
            <h3 className="text-lg font-semibold">
              Bütün şəkillər ({images.length})
            </h3>
            <button onClick={() => setGridOpen(false)}>
              <Xmark className="size-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-full aspect-square cursor-pointer overflow-hidden"
                onClick={() => handleOpenLightbox(index)}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${image}`}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={lightboxIndex}
        slides={images.map((src) => ({
          src: `${process.env.NEXT_PUBLIC_IMAGE_URL}/${src}`,
        }))}
        on={{
          view: ({ index }) => {
            setLightboxIndex(index)
          },
        }}

        render={{
          buttonZoom: () => null,
          controls: () => (
            <div>
              <div className='block lg:hidden'>
                <div className='absolute top-0 left-0 z-10 text-white w-full p-4 flex items-center justify-between'>
                  <button>
                    <Xmark className='size-6' onClick={() => setOpen(false)} />
                  </button>
                  <div>
                    {lightboxIndex + 1} / {images.length}
                  </div>
                  <button>
                    <Heart className='size-6' />
                  </button>
                </div>
                {/* öz yazıların */}
                <div className='absolute bottom-0 left-0 z-10 text-white w-full p-4 flex items-center justify-between'>
                  <div>
                    <p className='text-xl'>{formatNumber(price)} AZN</p>
                    <p className='text-[17px] truncate'>{make} {model}, {formatNumber(volume)} sm³, {year} il</p>
                  </div>
                  <div className='bg-green-500 p-2 rounded-full'>
                    <Handset className='size-7' />
                  </div>
                </div>
              </div>

              <div className='hidden lg:block'>
                <div className='absolute bottom-5 left-0 w-full'>
                  <div className='mx-auto flex flex-row gap-2 items-center justify-center overflow-auto flex-nowrap max-w-200'>
                    {
                      images.map((image:string, index:number) => (
                        <div
                          key={index}
                          onClick={() => setLightboxIndex(index)}
                          className={`
                            border rounded-lg
                            w-18 shrink-0
                            h-[50px]
                            bg-center
                            bg-cover
                            bg-no-repeat
                            cursor-pointer
                            transition-opacity
                            ${index === lightboxIndex ? 'opacity-100' : 'opacity-40 hover:opacity-70'}
                          `}
                          style={{
                           backgroundImage: `url(${process.env.NEXT_PUBLIC_IMAGE_URL}/${image})`
                          }}
                        />
                      ))
                    }
                  </div>
                </div>

                <div className='absolute top-0 left-0 z-10 py-2 px-10 bg-[#ffffff1a] text-white w-full flex items-center justify-between'>
                  <div className='flex items-center'>
                    <h3 className='text-xl'>{make} {model}</h3>
                    <div className='w-0.5 h-5 bg-white mx-4'></div>
                    <h3 className='text-xl'>{price} ₼</h3>
                  </div>
                  <div className='flex items-center gap-6'>
                    <div className='p-2 px-6 bg-green-500 flex items-center text-white gap-3 rounded-lg'>
                      <Handset className='size-5' />
                      Zeng et
                    </div>
                    <button onClick={() => setOpen(false)}>
                      <Xmark className='size-7' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ),
        }}

        toolbar={{
          buttons: [],
        }}

        plugins={[Zoom]}

        zoom={{
          maxZoomPixelRatio: 3,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: true,
        }}

        carousel={{
          finite: false,
          padding: 0,
          spacing: 0,
          imageProps: {
            style: {
              maxWidth: '100vw',
              maxHeight: '75vh',
              width: '100%',
              height: '75vh',
              objectFit: 'contain',
              position: 'absolute'
            },
          },
        }}
        styles={{
          container: { backgroundColor: 'black' },
          slide: { padding: 0 },
        }}
        controller={{
          closeOnPullDown: true,
          closeOnPullUp: true,
          closeOnBackdropClick: true,
        }}
      />
    </Fragment>
  )
}

export default Galery