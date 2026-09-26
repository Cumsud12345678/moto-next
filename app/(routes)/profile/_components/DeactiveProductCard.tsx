'use client'
import { PencilToSquare, TrashBin } from '@gravity-ui/icons'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowsRotateLeft, FileText } from '@gravity-ui/icons'
import Link from 'next/link'
import { ProductCard as CardType } from '@/types/product'
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

interface Props {
  product: CardType
  onDelete: (id: string) => void
  onExpiredListingUpdate: (id: string) => void
}

const DeactiveProductCard = ({ product, onDelete, onExpiredListingUpdate }: Props) => {
  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const [openAlertDelete, setOpenAlertDelete] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenAlertDelete(true)
  }

  if (!product) return null

  return (
    <>
      <div
        className={`rounded-lg overflow-hidden bg-white shadow border-2 ${
          product.isUrgent ? "border-orange-400" : ""
        }`}
      >
        <div className='relative aspect-4/3 overflow-hidden'>
          {product.isUrgent && (
            <div className='absolute p-0.5 px-1.5 bg-orange-400 text-white top-0 left-0 z-40 rounded-br-lg overflow-hidden shine-effect text-sm'>
              Tecili satilir
            </div>
          )}

          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${product.images[0]}`}
            alt=''
            fill
            className='object-cover hover:scale-105 transition-transform duration-300'
          />

          <div className='absolute bottom-0 right-0 m-2 flex gap-1 z-10'>
            {product.barter && (
              <div className='bg-green-500 p-1.5 rounded-full z-10'>
                <ArrowsRotateLeft className='text-white' />
              </div>
            )}
            {product.document && (
              <div className='bg-blue-500 p-1.5 rounded-full'>
                <FileText className='text-white' />
              </div>
            )}
          </div>

          {product.seller?.role === "seller" && (
            <div className='absolute bottom-0 left-0 z-10 m-2 flex gap-1'>
              <div className='bg-blue-500 text-white rounded-lg px-1.5 text-[12px]'>Resmi</div>
            </div>
          )}
        </div>

        <div className={`p-2 relative overflow-hidden ${product.isUrgent && 'shine-effect'}`}>
          <div>
            <span className="text-xl text-green-500 font-bold">
              {formatNumber(product.price)} ₼
            </span>
          </div>
          <p className='font-semibold text-[16px]'>{product.make.label} {product.model.label}</p>
          <p className='truncate text-[15px]'>{product.year}, {product.volume} sm³, {formatNumber(product.mileage)}</p>
          <p className='text-[14px] text-gray-400 truncate'>{product.region.label}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 p-2 pt-0">
          <button
            onClick={() => onExpiredListingUpdate(product._id)}
            className='w-full flex items-center justify-center gap-3 bg-blue-500 text-white p-2 rounded-lg'
          >
            <PencilToSquare />
            Aktiv et
          </button>

          <button
            onClick={handleDeleteClick}
            className='w-full flex items-center justify-center gap-3 bg-red-500 text-white p-2 rounded-lg'
          >
            <TrashBin />
            Sil
          </button>
        </div>
      </div>

      <AlertDialog open={openAlertDelete} onOpenChange={setOpenAlertDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Elanı silmək istəyirsiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu əməliyyat geri qaytarıla bilməz, elan tam silinəcək.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(product._id)
                setOpenAlertDelete(false)
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DeactiveProductCard