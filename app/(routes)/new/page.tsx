'use client'
import PlaceholderEffectInput from '@/components/inputs/PlaceholderEffectInput'
import { useFilter } from '@/hooks/useFilter'
import { Default } from '@/types/metadata'
import Image from 'next/image'
import React, { Fragment, useEffect, useState } from 'react'
import InputAndListString from './_components/InputAndListString'
import InputAndListNumber from './_components/InputAndListNumber'
import ButtonGroup from '@/components/buttons/ButtonGroup'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import PlaceholderNumberInput from '@/components/inputs/numberType/PlaceholderNumberInput'
import CheckboxButtons from '@/components/buttons/CheckboxButtons'
import SearchAndSelect from '@/components/inputs/SearchAndSelect'
import { ArrowsExpand, Xmark } from '@gravity-ui/icons'
import Dropzone from '@/components/Dropzone'
import imageCompression from 'browser-image-compression'

interface ImageFile  {
  id: string 
  url: string
  file: File
}

const NewPage = () => {

  const {
    make,
    setMake,

    models,
    model,
    setModel,

    years,
    minYear,
    setMinYear,

    volumes,
    minVolume,
    setMinVolume,

    category,
    setCategory,

    used,
    setUsed,

    barter,
    setBarter,

    credit,
    setCredit,

    document,
    setDocument,

    color,
    setColor,

    transmission,
    setTransmission,

    fuelType,
    setFuelType,

    minPower,
    setMinPower,

    minDistance,
    setMinDistance,

    equipment,
    addEquipment,

    city,
    setCity,

    minPrice,
    setMinPrice,
    
    
    setElement,
    
    metadata
  } = useFilter()

  useEffect(() => {
    if(!make) {
      setMinYear(0)
      setMinVolume(0)
    }
    if(!model) {
      setMinYear(0)
      setMinVolume(0)
    }
  }, [make, model, minYear])

  const [description, setDescription] = useState<string>('')


  const [images, setImages] = useState<ImageFile[]>([])
  
  
  const handleDrop = async (files: File[]) => {

    // if (images.length + files.length > 10) {
    //   toast.danger("Maksimum 10 şəkil əlavə edə bilərsiniz");
    //   return;
    // }

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      initialQuality: 0.85,
      useWebWorker: true
    }

    const compressedImages = await Promise.all(
      files.map(async (file) => {
        const compressedBlob = await imageCompression(file, options)

        // ✅ orijinal adı və tipi qoruyaraq real File obyekti yarat
        const compressedFile = new File(
          [compressedBlob],
          file.name,              // orijinal ad (uzantı daxil) saxlanılır
          { type: compressedBlob.type || file.type }
        )

        return {
          id: crypto.randomUUID(),
          url: URL.createObjectURL(compressedFile),
          file: compressedFile
        }
      })
    )

    setImages((prev) => [...prev, ...compressedImages])
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
      return prev.filter((img) => img.id !== id)
    })
  }

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0
    ) return

    setImages((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev

      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)

      if (!moved) return prev

      updated.splice(toIndex, 0, moved)

      return updated
    })
  }


  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const handleDragStart = (
    e: React.PointerEvent,
    index: number
  ) => {
    setDraggedIndex(index)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleDragMove = (e: React.PointerEvent) => {
    if (draggedIndex === null) return

    const target = window.document.elementFromPoint(
      e.clientX,
      e.clientY
    )

    const card = target?.closest('[data-image-index]')

    if (card) {
      const index = Number(
        card.getAttribute('data-image-index')
      )

      if (!Number.isNaN(index)) {
        setOverIndex(index)
      }
    }
  }

  const handleDragEnd = () => {
    if (
      draggedIndex !== null &&
      overIndex !== null &&
      draggedIndex !== overIndex
    ) {
      reorderImages(draggedIndex, overIndex)
    }

    setDraggedIndex(null)
    setOverIndex(null)
  }
  return (
    <div>
      <div className="flex flex-col w-full mt-10 lg:mt-30 lg:container mx-auto lg:max-w-187.5">
        <div className="lg:rounded-3xl lg:p-15 lg:bg-white flex flex-col lg:gap-8 gap-2 bg-[#f5f5f5]">
          <div className="flex items-center justify-center p-4 bg-white mt-3 lg:mt-0">
            <h1 className="lg:text-3xl text-2xl font-bold">Yeni elan</h1>
          </div>

          <div className="lg:p-10 border rounded-3xl bg-white p-5 flex flex-col">

            <InputAndListString state={make} setState={setMake} label='Marka' length={20} data={metadata.makes} />

            {
              make
              &&  <InputAndListString state={model} setState={setModel} label='Model' length={20} data={models} />
            }

            {
              model &&
              <InputAndListNumber state={minYear} setState={setMinYear} label='il' length={20} data={years} />
            }

            {
              minYear !== 0 &&
              <InputAndListNumber state={minVolume} setState={setMinVolume} label='hecm' length={20} data={volumes} />
            }

            {
              minYear !== 0 &&
              <div>
                <h3>Ban novu</h3>
                <ButtonGroup data={metadata.categories} state={category} setState={setCategory} wrap={false} isNew />
              </div>
            }
            
            {
              category &&
              <div>
                <div className='grid grid-cols-2 pt-7 gap-3'>
                  <div className='flex items-center justify-between w-full pr-5 border-r-3'>
                    <span>Yeni?</span>
                    <CustomSwitch checked={used} setChecked={setUsed} />
                  </div>
                  <div className='flex items-center justify-between w-full pl-5'>
                    <span>Barter?</span>
                    <CustomSwitch checked={barter} setChecked={setBarter} />
                  </div>
                  <div className='flex items-center justify-between w-full pr-5 border-r-3'>
                    <span>Kredit?</span>
                    <CustomSwitch checked={credit} setChecked={setCredit} />
                  </div>
                  <div className='flex items-center justify-between w-full pl-5'>
                    <span>Senedli?</span>
                    <CustomSwitch checked={document} setChecked={setDocument} />
                  </div>
                </div>

                <div className='pt-6'>
                  <h3 className='mb-2'>Reng</h3>
                  <ButtonGroup data={metadata.colors} state={color} setState={setColor} wrap={false} isNew />
                </div>

                <div className='pt-6'>
                  <h3 className='mb-2'>Muherrik</h3>
                  <ButtonGroup data={metadata.transmissions} state={transmission} setState={setTransmission} wrap={false} isNew />
                </div>

                <div className='pt-6'>
                  <h3 className='mb-2'>Suretler qutusu</h3>
                  <ButtonGroup data={metadata.fuel_types} state={fuelType} setState={setFuelType} wrap={false} isNew />
                </div>

              </div>
              
            }

          </div>

          {
            category && 
            <Fragment>
              <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-4 bg-white p-5">
                <h3 className="text-xl">Güc və Yürüş</h3>
                <div>
                  <PlaceholderNumberInput state={minPower} setState={setMinPower} label='Guc a.g.' length={30}  />
                </div>
                <div>
                  <PlaceholderNumberInput state={minDistance} setState={setMinDistance} label='Yuruyush km.' length={30} />
                </div>
              </div>

              <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
                <div>
                  <h3 className="text-xl mb-3">Məlumat *</h3>
                  <textarea
                    className="border focus:outline-sky-500 w-full rounded-xl px-3 py-2 h-32 bg-[#f5f5f5] resize-none"
                    placeholder="Motosiklet haqqında vacib məlumatları qeyd edin."
                    value={description}
                    maxLength={1000}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                  <span className="text-gray-500">
                    {description.length} / 1 000
                  </span>
                </div>
              </div>

              {/* Sekil */}
              <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
                <div>
                  <h3 className="text-xl mb-3">Şəkillər *</h3>
                  <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        data-image-index={index}
                        onPointerMove={handleDragMove}
                        onPointerUp={handleDragEnd}
                        onPointerCancel={handleDragEnd}
                      >
                        <div
                          className={`relative overflow-hidden rounded-2xl border transition-all ${draggedIndex === index
                              ? 'border-blue-400 opacity-50'
                              : overIndex === index && draggedIndex !== null
                                ? 'border-blue-400 scale-95'
                                : 'border-gray-200'
                            }`}
                        >

                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-25 object-cover pointer-events-none"
                          />

                          <button
                            onClick={() => removeImage(img.id)}
                            className="absolute cursor-pointer top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-white shadow-sm hover:bg-gray-100"
                          >
                            <Xmark />
                          </button>

                          <div
                            onPointerDown={(e) => handleDragStart(e, index)}
                            style={{ touchAction: 'none' }}
                            className="absolute cursor-grab active:cursor-grabbing top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-100"
                          >
                            <ArrowsExpand />
                          </div>

                        </div>
                      </div>
                    ))}

                    <div>
                      <Dropzone onDrop={handleDrop} />
                    </div>

                  </div>
                  <p className="text-md mt-4">Şəkillərin sırasını dəyişmək üçün sol yuxarı küncdəki tutacaqdan sürükləyin. Minimum 1, maksimum 10 şəkil</p>
                </div>
              </div>

              <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
                <div>
                  <h3 className="text-xl mb-3">Təchizat *</h3>
                  <CheckboxButtons data={metadata.equipments} ids={equipment} onClick={addEquipment} />
                </div>
              </div>


              <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-5 bg-white p-5">
                <h3 className="text-xl">Şəhər və Qiymət</h3>
                <div>
                  <SearchAndSelect data={metadata.cities} state={city} setState={setCity} label='Region' />
                </div>

                <div>
                  <PlaceholderNumberInput state={minPrice} setState={setMinPrice} label={'Qiymət *'} length={30} />
                </div>
              </div>
            </Fragment>
        }

        </div>
      </div>
    </div>
  )
}

export default NewPage