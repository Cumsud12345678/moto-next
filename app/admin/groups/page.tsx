'use client'
import Dropzone from '@/components/Dropzone'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { useImageDrop } from '@/hooks/useImageDrop'
import { api } from '@/lib/axios'
import { Minus, Plus, Xmark } from '@gravity-ui/icons'
import Image from 'next/image'
import React, { useState } from 'react'

import { columns, Group } from "./columns"
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


interface ImageFile  {
  id: string 
  url: string
  file: File
}

async function setGroup(formData: FormData) {
  const res = await api.post(
    `api/groups`,
    formData,
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' } // ya da tamamilə silin
    }
  )

  return res.data
}

const GroupsPage = () => {

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [groupName, setGroupName] = useState<string>('')
  const [groupLink, setGroupLink] = useState<string>('')
  const [images, setImages] = useState<ImageFile[]>([])

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
    if(!groupName?.trim()) return toast.add({type: 'danger', description: 'Grup adını daxil edin'});
    if(!groupLink?.trim()) return toast.add({type: 'danger', description: 'Grup linkini daxil edin'});
    if(images.length === 0) return toast.add({type: 'danger', description: 'Sekil secin'});

    const formData = new FormData()

    formData.append('logo', images[0]?.file)
    formData.append('title', groupName)
    formData.append('link', groupLink)

    toast.promise(
      setGroup(formData),
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

  const [data, setData] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get('/api/groups', { withCredentials: true })
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
  const [deleteGroupData, setDeleteGroupData] = useState<Group | undefined>(undefined)

  const handleDelete = async (group: Group) => {
    setDeletedOpen(true)
    setDeleteGroupData(group)
  }

  async function deleteGroup() {
    const res = await api.delete(
      `/api/groups/${deleteGroupData?._id}`, {
      withCredentials: true
    }
    )
    return res.data
  }

  const handleDeleteGroup = async () => {
    toast.promise(
      deleteGroup(),
      {
        loading: 'Grup silinir',
        success: () => {
          setData(prev => prev.filter(a => a._id !== deleteGroupData?._id))
          return 'Grup silindi'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }


  const [open, setOpen] = useState<boolean>(false)
  const [editGroupData, setEditGroupData] = useState<Group | undefined>(undefined)

  const handleEdit = (group: Group) => {
    // Modal açın və ya edit səhifəsinə yönləndirin
    setOpen(true)
    setEditGroupData(group)
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
            group={editGroupData}
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
                <AlertDialogAction onClick={handleDeleteGroup} variant="destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
    
  )
}

export default GroupsPage