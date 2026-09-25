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
import { Group } from "./columns"
import { api } from "@/lib/axios"
import Dropzone from "@/components/Dropzone"
import Image from "next/image"
import { Xmark } from "@gravity-ui/icons"
import { useImageDrop } from "@/hooks/useImageDrop"

interface EditDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: Group[],
  setData: React.Dispatch<React.SetStateAction<Group[]>>
  group: Group | undefined
}

interface ImageFile  {
  id: string 
  url: string
  file: File
}

async function setGroup(formData: FormData, id: string | undefined) {
  const res = await api.put(
    `api/groups/${id}`,
    formData,
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' } // ya da tamamilə silin
    }
  )

  return res.data
}

export default function EditDialog({ open, setOpen, data, setData, group }: EditDialogProps) {

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [groupName, setGroupName] = useState<string | undefined>(group?.title)
  const [groupLink, setGroupLink] = useState<string | undefined>(group?.link)

  const [oldImage, setOldImage] = useState<string | undefined>(group?.logo)

  const [images, setImages] = useState<ImageFile[]>([])

  useEffect(() => {
    setGroupName(group?.title)
    setGroupLink(group?.link)
    setOldImage(group?.logo)
  }, [group])

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

  const setGroupForm = () => {
    if (!groupName?.trim()) return toast.add({ type: 'danger', description: 'Grup adını daxil edin' });
    if (!groupLink?.trim()) return toast.add({ type: 'danger', description: 'Grup linkini daxil edin' });
    if (images.length === 0 && !oldImage) return toast.add({ type: 'danger', description: 'Sekil secin' });

    const formData = new FormData()

    formData.append('logo', images[0]?.file || null)
    formData.append('title', groupName)
    formData.append('link', groupLink)

    toast.promise(
      setGroup(formData, group?._id),
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
                  <Label>Group name</Label>
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='Group name'
                  />
                </div>
                <div>
                  <Label>Goup link</Label>
                  <input
                    value={groupLink}
                    onChange={(e) => setGroupLink(e.target.value)}
                    className='p-2 border rounded-lg bg-white max-w-75'
                    type="text"
                    placeholder='Goup link'
                  />
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
                  onClick={setGroupForm}
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