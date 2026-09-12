'use client'
import CheckboxButtons from '@/components/buttons/CheckboxButtons'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import Dropzone from '@/components/Dropzone'
import PlaceholderNumberInput from '@/components/inputs/numberType/PlaceholderNumberInput'
import SearchAndSelect from '@/components/inputs/SearchAndSelect'
import { useFilter } from '@/hooks/useFilter'
import { useImageDrop } from '@/hooks/useImageDrop'
import { Metadata } from '@/types/metadata'
import { ArrowsExpand, Xmark } from '@gravity-ui/icons'
import React, { Fragment, useState } from 'react'

interface ImageFile  {
  id: string 
  url: string
  file: File
}

interface Step2Props {
  filterState: ReturnType<typeof useFilter>
  metadata: Metadata
  images: ImageFile[]
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>
  description: string,
  setDescription: React.Dispatch<React.SetStateAction<string>>
  power: number,
  setPower: React.Dispatch<React.SetStateAction<number>>,
  distance: number,
  setDistance: React.Dispatch<React.SetStateAction<number>>,
  price: number,
  setPrice: React.Dispatch<React.SetStateAction<number>>
}

const Step2 = ({
  filterState, 
  metadata, 
  images, 
  setImages, 
  description, 
  setDescription, 
  power,
  setPower,
  distance,
  setDistance,
  price,
  setPrice
}: Step2Props) => {

  const {
    used,
    setUsed,

    barter,
    setBarter,

    credit,
    setCredit,

    document,
    setDocument,

    equipment,
    addEquipment,

    city,
    setCity,

  } = filterState

  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

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

  return (
    <Fragment>
      <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-8 bg-white p-5">
        <div>
          <h3 className="text-xl mb-3">Ayarlar *</h3>
          <div className='grid grid-cols-2 pt-3 gap-3'>
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
        </div>
      </div>


      <div className="lg:p-10 lg:border rounded-3xl flex flex-col gap-4 bg-white p-5">
        <h3 className="text-xl">Güc və Yürüş</h3>
        <div>
          <PlaceholderNumberInput state={power} setState={setPower} label='Guc a.g.' length={30} />
        </div>
        <div>
          <PlaceholderNumberInput state={distance} setState={setDistance} label='Yuruyush km.' length={30} />
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
          <PlaceholderNumberInput state={price} setState={setPrice} label={'Qiymət *'} length={30} />
        </div>
      </div>
    </Fragment>
  )
}

export default Step2