'use client'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"

import { toast } from "@/components/ui/toast"
import React, { useEffect, useState } from "react"
import { Adsense } from "./columns"
import { api } from "@/lib/axios"
import Dropzone from "@/components/Dropzone"
import Image from "next/image"
import { Xmark } from "@gravity-ui/icons"
import { useImageDrop } from "@/hooks/useImageDrop"
import CustomSwitch from "@/components/buttons/CustomSwitch"

interface EditDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: Adsense[],
  setData: React.Dispatch<React.SetStateAction<Adsense[]>>
  adsense: Adsense | undefined
}

interface ImageFile  {
  id: string 
  url: string
  file: File
}

async function setAdsense(formData: FormData, id: string | undefined) {
  const res = await api.put(
    `api/adsense/${id}`,
    formData,
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' } // ya da tamamilə silin
    }
  )

  return res.data
}

export default function EditDialog({ open, setOpen, data, setData, adsense }: EditDialogProps) {

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [adsenseLink, setAdsenseLink] = useState<string | undefined>(adsense?.link)
  const [adsensePosition, setAdsensePosition] = useState<'mobile' | 'deskop_left' | 'deskop_right' | string | undefined>(adsense?.position)
  const [ownerName, setOwnerName] = useState<string | undefined>(adsense?.ownerName)
  const [ownerPhone, setOwnerPhone] = useState<string | undefined>(adsense?.ownerPhone)
  const [expiresDay, setExpiresDay] = useState<string | undefined>(adsense?.adsenseExpiresAt)
  const [isHome, setIsHome] = useState<boolean | null>(null)
  const [isDetails, setIsDetails] = useState<boolean | null>(null)

  const [oldImage, setOldImage] = useState<string | undefined>(adsense?.logo)

  const [images, setImages] = useState<ImageFile[]>([])

  useEffect(() => {
    setAdsenseLink(adsense?.link)
    setAdsensePosition(adsense?.position)
    setOwnerName(adsense?.ownerName)
    setOwnerPhone(adsense?.ownerPhone)
    setExpiresDay(adsense?.adsenseExpiresAt)
    setOldImage(adsense?.logo)
    if(adsense?.isHome !== undefined && adsense?.isDetails !== undefined) {
      setIsHome(adsense.isHome)
      setIsDetails(adsense.isDetails)
    }
  }, [adsense])

  const
  {
    handleDragMove,
    handleDragEnd,
    removeImage,
    handleDragStart,
    handleDrop
  } =
  useImageDrop({
    images,
    setImages,
    draggedIndex,
    setDraggedIndex,
    overIndex,
    setOverIndex,
  })

  const handleDeleteImage = (id: string) => {
    removeImage(id)
  }

  const setAdsenseForm = () => {
    if(!adsenseLink?.trim()) return toast.add({type: 'danger', description: 'Adsense link daxil edin'});
    if(!adsensePosition?.trim()) return toast.add({type: 'danger', description: 'Adsense position daxil edin'});
    if(!ownerName?.trim()) return toast.add({type: 'danger', description: 'Owner name daxil edin'});
    if(!ownerPhone?.trim()) return toast.add({type: 'danger', description: 'Owner phone daxil edin'});
    if(!expiresDay?.trim()) return toast.add({type: 'danger', description: 'Expires day daxil edin'});

    if(images.length === 0 && !oldImage) return toast.add({type: 'danger', description: 'Sekil secin'});

    const formData = new FormData()

    formData.append('logo', images[0]?.file || null)
    formData.append('link', adsenseLink)
    formData.append('position', adsensePosition)
    if (isHome !== null) formData.append('isHome', String(isHome));
    if (isDetails !== null) formData.append('isDetails', String(isDetails));
    formData.append('day', String(expiresDay))
    formData.append('ownerName', ownerName)
    formData.append('ownerPhone', String(ownerPhone))

    toast.promise(
      setAdsense(formData, adsense?._id),
      {
        loading: 'Kayit etklenir',
        success: () => {
          return 'Kayit eklendi.'
        },
        error: (err) => err.message || 'Xeta bas verdi'
      }
    )
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Group edit</DialogTitle>
          <DialogDescription>

            <div className='bg-white p-3 rounded-lg w-full'>
              <div className='flex flex-col gap-5'>
                <div>
                  <Label>Adsense link</Label>
                  <input
                    value={adsenseLink}
                    onChange={(e) => setAdsenseLink(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='Adsense link'
                  />
                </div>
                <div>
                  <Label>Adsense position</Label>
                  <input
                    value={adsensePosition}
                    onChange={(e) => setAdsensePosition(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='mobile | desktop_left | desktop_right'
                  />
                </div>
                <div>
                  <Label>Owner name</Label>
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='Owner name'
                  />
                </div>
                <div>
                  <Label>Owner phone</Label>
                  <input
                    value={adsenseLink}
                    onChange={(e) => setAdsenseLink(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='Owner phone'
                  />
                </div>
                <div>
                  <Label>Gun </Label>
                  <input
                    value={expiresDay}
                    onChange={(e) => setExpiresDay(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='Gun'
                  />
                </div>
                <div className='flex items-center justify-between w-full pl-5'>
                  <span>Home?</span>
                  <CustomSwitch checked={isHome} setChecked={setIsHome} />
                </div>
                <div className='flex items-center justify-between w-full pl-5'>
                  <span>Details?</span>
                  <CustomSwitch checked={isDetails} setChecked={setIsDetails} />
                </div>
                {
                  oldImage
                    ?
                    <div className='bg-white p-3 rounded'>
                      <div key={oldImage} className='relative'>
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${oldImage}`}
                          alt=""
                          width={200}
                          height={100}
                        />

                        <button onClick={() => setOldImage('')} className='absolute top-0 right-0 bg-gray-300 m-2 rounded-full'>
                          <Xmark className='size-7 text-red-500' />
                        </button>
                      </div>
                    </div>
                    :
                    images.length === 0
                      ?
                      <div>
                        <Dropzone onDrop={handleDrop} />
                      </div>
                      :
                      <div className='bg-white p-3 rounded'>
                        {
                          images.map(img => (
                            <div key={img.url} className='relative'>
                              <Image
                                src={img.url}
                                alt=""
                                width={200}
                                height={100}
                              />

                              <button onClick={() => handleDeleteImage(img.id)} className='absolute top-0 right-0 bg-gray-300 m-2 rounded-full'>
                                <Xmark className='size-7 text-red-500' />
                              </button>
                            </div>

                          ))
                        }
                      </div>
                }

                <button
                  onClick={setAdsenseForm}
                  className='w-full bg-blue-500 p-2 rounded-xl text-white mt-5 cursor-pointer'
                >
                  Kaydet
                </button>

              </div>
            </div>

          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}