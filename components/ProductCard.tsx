'use client'
import { Heart, PencilToSquare, TrashBin } from '@gravity-ui/icons'
import {HeartFill} from '@gravity-ui/icons';
import Image from 'next/image'
import React, { useState } from 'react'
import {ArrowsRotateLeft} from '@gravity-ui/icons';
import {FileText} from '@gravity-ui/icons';
import Link from 'next/link';
import { ProductCard as CardType } from '@/types/product';

const ProductCard = ({product}: {product: CardType}) => {

  const [data, setData] = useState<CardType>(product)

  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const handleLike = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    
    setData(prev => ({
      ...prev,
      isLiked: !data.isLiked
    }))

  }

  if(!product) {
    return (
      <div>
        
      </div>
    )
  }

  console.log(product.images[0])

  return (
    <Link
      href={`/elanlar/${product.make.label}-${product.model.label}-${product._id}`}
      className={`rounded-lg overflow-hidden bg-white shadow ${product.isUrgent ? "border-orange-400" : ""} border-2`}
    >
      <div className='relative aspect-4/3 overflow-hidden'>
        {
          product.isUrgent &&
          <div className='absolute p-0.5 px-1.5 bg-orange-400 text-white top-0 left-0 z-40 rounded-br-lg overflow-hidden shine-effect text-sm'>
            Tecili satilir
          </div>
        }

        <div onClick={(e: React.MouseEvent<HTMLDivElement>) => handleLike(e)}>
          {
            data.isLiked
            ? <HeartFill className='absolute top-0 right-0 z-10 size-6 m-2 text-red-600' />
            : <Heart className='absolute top-0 right-0 z-10 size-6 m-2 text-white'/> 
          }
        </div>
        
        
        <Image src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.images[0]}`} alt='' fill className='object-cover hover:scale-105 transition-transform duration-300'/>
        <div className='absolute bottom-0 right-0 m-2 flex gap-1 z-10'>
          {
            product.barter && 
            <div className='bg-green-500 p-1.5 rounded-full z-10'>
              <ArrowsRotateLeft className='text-white' />
            </div>
          }
          {
            product.document &&
            <div className='bg-blue-500 p-1.5 rounded-full'>
              <FileText className='text-white' />
            </div>
          }
          
        </div>

        {
          product.seller.role === "seller" && 
          <div className='absolute bottom-0 left-0 z-10 m-2 flex gap-1'>
            <div className='bg-blue-500 text-white rounded-lg px-1.5 text-[12px]'>
              Resmi
            </div>
          </div>
        }
        
      </div>
      <div className={`p-2 relative overflow-hidden ${product.isUrgent && 'shine-effect'}`}>
        <div className="">
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