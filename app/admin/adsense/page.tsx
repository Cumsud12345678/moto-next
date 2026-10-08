'use client'
import Dropzone from '@/components/Dropzone'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { useImageDrop } from '@/hooks/useImageDrop'
import { api } from '@/lib/axios'
import { Minus, Plus, Xmark } from '@gravity-ui/icons'
import Image from 'next/image'
import React, { useState } from 'react'

import { columns, Adsense } from "./columns"
import { DataTable } from "../components/data-table"
import { useEffect } from "react"
import EditDialog from "./edit-dialog"

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TrashBin } from "@gravity-ui/icons"
import PlaceholderEffectInput from "@/components/inputs/PlaceholderEffectInput"
import { useRouter } from "next/navigation"
import CustomSwitch from '@/components/buttons/CustomSwitch'


interface ImageFile  {
  id: string 
  url: string
  file: File
}

async function setAdsense(formData: FormData) {
  const res = await api.post(
    `api/adsense`,
    formData,
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' } // ya da tamamilə silin
    }
  )

  return res.data
}

const AdsensePage = () => {

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [images, setImages] = useState<ImageFile[]>([])

  const [adsenseLink, setAdsenseLink] = useState<string>('')
  const [adsensePosition, setAdsensePosition] = useState<'mobile' | 'deskop_left' | 'deskop_right' | string>('')
  const [ownerName, setOwnerName] = useState<string>('')
  const [ownerPhone, setOwnerPhone] = useState<string>('')
  const [expiresDay, setExpiresDay] = useState<string>('')
  const [isHome, setIsHome] = useState<boolean | null>(null)
  const [isDetails, setIsDetails] = useState<boolean | null>(null)

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
    
    if(images.length === 0) return toast.add({type: 'danger', description: 'Sekil secin'});

    const formData = new FormData()

    formData.append('logo', images[0]?.file)
    formData.append('link', adsenseLink)
    formData.append('position', adsensePosition)
    if (isHome !== null) formData.append('isHome', String(isHome));
    if (isDetails !== null) formData.append('isDetails', String(isDetails));
    formData.append('day', String(expiresDay))
    formData.append('ownerName', ownerName)
    formData.append('ownerPhone', String(ownerPhone))

    toast.promise(
      setAdsense(formData),
      {
        loading: 'Kayit etklenir',
        success: () => {
          return 'Kayit eklendi.'
        },
        error: (err) => err.message || 'Xeta bas verdi'
      }
    )
  }



  // liste
  const router = useRouter()

  const [data, setData] = useState<Adsense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get('/api/adsense', { withCredentials: true })
        setData(res.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])


  const [deletedOpen, setDeletedOpen] = useState<boolean>(false)
  const [deleteAdsenseData, setDeleteAdsenseData] = useState<Adsense | undefined>(undefined)

  const handleDelete = async (adsense: Adsense) => {
    setDeletedOpen(true)
    setDeleteAdsenseData(adsense)
  }

  async function deleteAdsense() {
    const res = await api.delete(
      `/api/adsense/${deleteAdsenseData?._id}`, {
      withCredentials: true
    }
    )
    return res.data
  }

  const handleDeleteAdsense = async () => {
    toast.promise(
      deleteAdsense(),
      {
        loading: 'Adsense silinir',
        success: () => {
          setData(prev => prev.filter(a => a._id !== deleteAdsenseData?._id))
          return 'Grup silindi'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }


  const [open, setOpen] = useState<boolean>(false)
  const [editAdsenseData, setEditAdsenseData] = useState<Adsense | undefined>(undefined)

  const handleEdit = (adsense: Adsense) => {
    // Modal açın və ya edit səhifəsinə yönləndirin
    setOpen(true)
    setEditAdsenseData(adsense)
  }

  if (loading) {
    return <div>Loading...</div>
  }


  return (
    <div>
      <div className='w-full flex flex-col lg:flex-row p-5 min-w-100'>
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
                value={ownerPhone} 
                onChange={(e) => setOwnerPhone(e.target.value)}
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

        <div className="container mx-auto p-4">

          <DataTable
            columns={columns}
            data={data}
            meta={{ onEdit: handleEdit, onDelete: handleDelete }}
          />

          <EditDialog
            open={open}
            setOpen={setOpen}
            data={data}
            setData={setData}
            adsense={editAdsenseData}
          />

          <AlertDialog open={deletedOpen} onOpenChange={setDeletedOpen}>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <TrashBin />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                <AlertDialogDescription>
                  <div>
                    Silmek isdediyinize eminsiniz?
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAdsense} variant="destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
    
  )
}

export default AdsensePage