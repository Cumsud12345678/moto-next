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
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

import * as React from "react"
// import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'

interface Props {
  product: CardType
  giftCount: number,
  setGiftCount: React.Dispatch<React.SetStateAction<number>>
  onDelete: (id: string) => void
  onUrgent: (id: string) => void
}

const ActiveProductCard = ({ product, giftCount, setGiftCount, onDelete, onUrgent }: Props) => {

  const formatNumber = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  const [openAlertDelete, setOpenAlertDelete] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenAlertDelete(true)
  }

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // navigate to edit — router.push istifadə etmək istəsən useRouter əlavə et
    window.location.href = `/edit/${product._id}` // öz edit route-una uyğunlaşdır
  }


  const [open, setOpen] = React.useState(false)
  const [deliveryTime, setDeliveryTime] = React.useState("asap")
  const isMobile = useIsMobile()

  const deliveryTimes = [
    {
      value: "asap",
      id: "delivery-asap",
      label: "1 gün",
      description: "1 azn",
      ...(giftCount && { badge: "Pulsuz" }),
    },
    // {
    //   value: "5-00",
    //   id: "delivery-5-00",
    //   label: "3 gün",
    //   description: "2 azn",
    // },
    // {
    //   value: "5-30",
    //   id: "delivery-5-30",
    //   label: "7 gün",
    //   description: "5 azn",
    // },
    // {
    //   value: "6-00",
    //   id: "delivery-6-00",
    //   label: "15 gün",
    //   description: "9 azn",
    // }
  ]

  const handlePremiumClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  if (!product) return null

  return (
    <>
      <Link
        href={`/elanlar/${product.make.label}-${product.model.label}-${product._id}`}
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
          <p className='text-[16px] truncate'>{product.make.label} {product.model.label}</p>
          <p className='truncate text-[15px]'>{product.year}, {product.volume} sm³, {formatNumber(product.mileage)}</p>
          <p className='text-[14px] text-gray-400 truncate'>{product.region.label}, {product.createdAt}</p>
        </div>

        <div className='flex flex-col px-2 pb-2 gap-2'>
          <div className="flex flex-col sm:flex-row gap-2 pt-0">
            <button
              onClick={handleEditClick}
              className='w-full flex items-center justify-center gap-3 bg-blue-500 text-white p-2 rounded-lg'
            >
              <PencilToSquare />
              Düzəlt
            </button>

            <button
              onClick={handleDeleteClick}
              className='w-full flex items-center justify-center gap-3 bg-red-500 text-white p-2 rounded-lg'
            >
              <TrashBin />
              Sil
            </button>
          </div>
          {
            (giftCount > 0 && !product.isUrgent)
            &&
            <button
              onClick={handlePremiumClick}
              className='w-full flex items-center justify-center gap-3 bg-green-500 text-white p-2 rounded-lg'
            >
              Pulsuz premium et
            </button>
          }
          
        </div>
        
      </Link>

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


      <Drawer
        open={open}
        onOpenChange={setOpen}
        showSwipeHandle={isMobile}
        swipeDirection={isMobile ? "down" : "right"}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Elanı premium et</DrawerTitle>
            {/* <DrawerDescription>
              We&apos;ll prepare your order as soon as possible.
            </DrawerDescription> */}
          </DrawerHeader>
          <div className="flex-1 scroll-fade overflow-y-auto p-4">
            <RadioGroup
              value={deliveryTime}
              onValueChange={setDeliveryTime}
              className="gap-2"
            >
              {deliveryTimes.map((time) => (
                <FieldLabel key={time.value} htmlFor={time.id}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle className="flex items-center gap-2">
                        {time.label}
                        {time.badge ? (
                          <Badge variant="destructive">{time.badge}</Badge>
                        ) : null}
                      </FieldTitle>
                      <FieldDescription>{time.description}</FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={time.value} id={time.id} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </div>
          <DrawerFooter>
            <Button onClick={() => onUrgent(product._id)} className="h-[34px]">
              Tətbiq et
            </Button>
            <DrawerClose render={<Button variant="outline">Ləğv et</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

    </>
  )
}

export default ActiveProductCard