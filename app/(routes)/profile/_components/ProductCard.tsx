'use client'
import { Product } from '@/types/product'
import { Heart, PencilToSquare, TrashBin } from '@gravity-ui/icons'
import {HeartFill} from '@gravity-ui/icons';
import Image from 'next/image'
import React, { Fragment, useEffect, useState } from 'react'
import {ArrowsRotateLeft} from '@gravity-ui/icons';
import {FileText} from '@gravity-ui/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ProductCard = ({product, onDelete}: {product: Product, onDelete: (id: number) => void}) => {

  const [data, setData] = useState<Product>(product)
  const pathname = usePathname()

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

  const [openAlertDelete, setOpenAlertDelete] = useState<boolean>(false)

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setOpenAlertDelete(true)
  }

  return (
    <Fragment>
      <Link
        href={`/elanlar/${product.make}-${product.model}-${product._id}`}
        className={`rounded-lg overflow-hidden bg-white shadow ${product.sellerType === "premium" ? "border-orange-400" : ""} border-2`}
      >
        <div className='relative aspect-4/3 overflow-hidden'>
          {
            product.sellerType === "premium" &&
            <div className='absolute p-0.5 px-1.5 bg-orange-400 text-white top-0 left-0 z-40 rounded-br-lg overflow-hidden shine-effect'>
              Tecili satilir
            </div>
          }

          <div onClick={(e: React.MouseEvent<HTMLDivElement>) => handleLike(e)}>
            {
              data.isLiked
                ? <HeartFill className='absolute top-0 right-0 z-10 size-6 m-2 text-red-600' />
                : <Heart className='absolute top-0 right-0 z-10 size-6 m-2 text-white' />
            }
          </div>


          <Image src={product.image} alt='' fill className='object-cover hover:scale-105 transition-transform duration-300' />
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
            product.role === "seller" &&
            <div className='absolute bottom-0 left-0 z-10 m-2 flex gap-1'>
              <div className='bg-blue-500 text-white rounded-lg px-1.5 text-[12px]'>
                Resmi
              </div>
            </div>
          }

        </div>
        <div className={`p-2 relative overflow-hidden ${product.sellerType === "premium" && 'shine-effect'}`}>
          <div className="">
            <span className="text-2xl text-green-500 font-bold">
              {formatNumber(product.price)} ₼
            </span>
          </div>
          <p className='font-semibold text-[17px]'>{product.make} {product.model}</p>
          <p className='truncate'>{product.year}, {product.volume} sm³, {formatNumber(product.mileage)}</p>
          <p className='text-[14px] text-gray-400 truncate'>{product.city}, {product.createdAt}</p>
        </div>


        <div className="flex flex-col sm:flex-row gap-2 p-2 pt-0">
          <button className='w-full flex items-center justify-center gap-3 bg-blue-500 text-white p-2 rounded-lg'>
            <PencilToSquare />
            Düzəlt
          </button>

          <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDelete(e)} className='w-full flex items-center justify-center gap-3 bg-red-500 text-white p-2 rounded-lg'>
            <TrashBin />
            Sil
          </button>
        </div>
      </Link>


      <AlertDialog open={openAlertDelete} onOpenChange={setOpenAlertDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat conversation. View{" "}
              <a href="#">Settings</a> delete any memories saved during this chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              variant="outline"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              onClick={() => onDelete(product._id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Fragment>
    
  )
}

export default ProductCard