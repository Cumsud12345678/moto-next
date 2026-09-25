'use client'
import Dropzone from '@/components/Dropzone'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { useImageDrop } from '@/hooks/useImageDrop'
import { api } from '@/lib/axios'
import { Minus, Plus, Xmark } from '@gravity-ui/icons'
import Image from 'next/image'
import React, { useState } from 'react'

interface ImageFile  {
  id: string 
  url: string
  file: File
}

async function setMakeModel(formData: FormData) {
  const res = await api.post(
    `api/metadata/make&model`,
    formData,
    { 
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' } // ya da tamamilə silin
    }
  )

  return res.data
}

const MetadataPage = () => {

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [make, setMake] = useState<string>('')
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

  const [stateModels, setStateModels] = useState<{name: string}[]>([
    { name: '' }
  ])

  const addModel = () => {
    setStateModels([...stateModels, { name: '' }])
  }

  const removeModel = (index: number) => {
    setStateModels(stateModels.filter((_, i) => i !== index))
  }

  // const setMakeModelForm = () => {

  // }

  const setMakeModelForm = () => {
    if(!make?.trim()) return toast.add({type: 'danger', description: 'Marka adını daxil edin'})
    if(images.length === 0) return toast.add({type: 'danger', description: 'Sekil secin'})

    const formData = new FormData()

    formData.append('logo', images[0]?.file)
    formData.append('makeLabel', make)
    formData.append(
      'modelLabels',
      JSON.stringify(
        stateModels
          .map(item => item.name.trim())
          .filter(item => item !== '')
      )
    )

    toast.promise(
      setMakeModel(formData),
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
    <div>
      <div className='w-full flex flex-col lg:flex-row p-5'>
        <div className='bg-white p-3 rounded-lg w-full'>
          <div>
            <h3>Marka & Model</h3>
            <input value={make} onChange={(e) => setMake(e.target.value)} type="text" className='p-2 border rounded-lg bg-white max-w-[300px]' placeholder='Marka' />
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

            <div className='max-w-75 mt-2 flex flex-col gap-3'>
              <Label style={{ marginBottom: '-10px' }}>Model</Label>
              {
                stateModels.map((item, index) => (
                  <div key={index} className='flex items-center justify-between gap-2'>
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const newModels = [...stateModels]
                        newModels[index].name = e.target.value
                        setStateModels(newModels)
                      }}
                      type="text"
                      className='p-2 border rounded-lg bg-white w-full'
                      placeholder='Model'
                    />
                    <button
                      onClick={addModel}
                      className='cursor-pointer p-2 bg-blue-500 rounded-sm'
                    >
                      <Plus className='size-5 text-white' />
                    </button>
                    {
                      stateModels.length >= 2 &&
                      <button
                        onClick={() => removeModel(index)}
                        className='cursor-pointer p-2 bg-red-500 rounded-sm'
                      >
                        <Minus className='size-5 text-white' />
                      </button>
                    }
                  </div>
                ))
              }

              <button
                onClick={setMakeModelForm}
                className='w-full bg-blue-500 p-2 rounded-xl text-white mt-5 cursor-pointer'
              >
                Kaydet
              </button>

            </div>
            
          </div>
        </div>
        <div>

        </div>
      </div>
    </div>
    
  )
}

export default MetadataPage