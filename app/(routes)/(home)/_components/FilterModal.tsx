'use client'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Default, Metadata } from '@/types/metadata'
import { useFilter } from '@/hooks/useFilter'
import CustomDrawer from '@/components/CustomDrawer'
import ThreeButton from '@/components/buttons/ThreeButton'

import {ChevronRight, Xmark} from '@gravity-ui/icons';
import DialogModal from './DialogModal'
import PlaceholderEffectInput from '@/components/inputs/PlaceholderEffectInput'
import PlaceholderNumberInput from '@/components/inputs/numberType/PlaceholderNumberInput'
import TwoInputGroup from './TwoInputGroup'
import { Switch } from "@/components/ui/switch"
import CustomSwitch from '@/components/buttons/CustomSwitch'
import ButtonGroup from '@/components/buttons/ButtonGroup'
import CheckboxButtons from '@/components/buttons/CheckboxButtons'

type SetElement = (
  key: React.Dispatch<React.SetStateAction<string>>,
  value: string
) => void

interface FilterModalProps {
  open: boolean,
}

const FilterModal = ({open}: FilterModalProps) => {
  
  const {
    makes,
    make,
    setMake,
    models,
    model,
    setModel,
    used,
    setUsed,
    cities,
    city,
    setCity,
    
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,

    credit,
    setCredit,

    barter,
    setBarter,

    isNew,
    setIsNew,

    fuelType,
    setFuelType,

    transmission,
    setTransmission,

    volumes,
    minVolume,
    setMinVolume,
    maxVolume,
    setMaxVolume,

    minDistance,
    setMinDistance,
    maxDistance,
    setMaxDistance,

    minPower,
    setMinPower,
    maxPower,
    setMaxPower,

    years,
    minYear,
    setMinYear,
    maxYear,
    setMaxYear,

    color,
    setColor,

    equipment,
    addEquipment,

    setElement,
    document,
    setDocument,
    category,
    setCategory,
    metadata
  } = useFilter()

  const [makeModalOpen, setMakeModalOpen] = useState<boolean>(false)
  const [modelModalOpen, setModelModalOpen] = useState<boolean>(false)
  const [cityModalOpen, setCityModalOpen] = useState<boolean>(false)

  const selectedMake = (id: string) => {
    setMake(id)
    setModel('')
    setMakeModalOpen(false)
    setModelModalOpen(true)
  }

  const selectedModel = (id: string) => {
    setModel(id)
    setModelModalOpen(false)
  }

  const selectedCity = (id: string) => {
    setCity(id)
    setCityModalOpen(false)
  }
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        if (!open) {
          window.history.back()
        }
      }}
    >
      <DialogContent 
        className='w-full h-full max-w-none sm-w-full rounded-none flex flex-col bg-[#fbfbfb] p-0 overflow-y-auto'
      >
        <DialogHeader className='h-auto px-3 mt-5 text-2xl'>
          Filterler
        </DialogHeader>

        <div className='flex flex-col gap-3 h-full'>
          <div className='px-3'>
            <div className='bg-white px-4 rounded-lg shadow'>
              <div className='flex items-center justify-between border-b relative'>
                <span 
                  onClick={() => setMakeModalOpen(true)} 
                  className='h-14 w-full flex items-center'
                >
                  {
                    make 
                    ? 
                    <div className='flex flex-col'>
                      <span className='text-gray-400 text-[13px] absolute top-2'>Marka</span>
                      <span className='text-[17px] mt-4'>{makes.find((item: Default) => item._id === make)?.label}</span>
                    </div>
                     : <span className='text-[17px]'>Butun markalar</span>
                  }
                </span>
                <button>
                  {
                    make 
                    ? <Xmark onClick={() => setMake('')} />
                    : <ChevronRight onClick={() => setMakeModalOpen(true)} />
                  }
                </button>
              </div>
              <div className='flex items-center justify-between border-b relative'>
                <span 
                  onClick={() => setModelModalOpen(true)} 
                  className='h-14 w-full flex items-center'
                >
                  {
                    model 
                    ? 
                    <div className='flex flex-col'>
                      <span className='text-gray-400 text-[13px] absolute top-2'>Model</span>
                      <span className='text-[17px] mt-4'>{model ? metadata.models.find((item: Default) => item._id === model)?.label : 'Butun modeller'}</span>
                    </div>
                     : <span className='text-[17px]'>Butun modeller</span>
                  }
                </span>
                <button>
                  {
                    model 
                    ? <Xmark onClick={() => setModel('')} />
                    : <ChevronRight onClick={() => setModelModalOpen(true)} />
                  }
                </button>
              </div>
              <div className='flex items-center justify-between border-b relative'>
                <span 
                  onClick={() => setCityModalOpen(true)} 
                  className='h-14 w-full flex items-center'
                >
                  {
                    city 
                    ? 
                    <div className='flex flex-col'>
                      <span className='text-gray-400 text-[13px] absolute top-2'>Region</span>
                      <span className='text-[17px] mt-4'>{city ? metadata.cities.find((item: Default) => item._id === city)?.label : 'Butun regionlar'}</span>
                    </div>
                     : <span className='text-[17px]' onClick={() => setCityModalOpen(true)}>Butun regionlar</span>
                  }
                </span>
                <button>
                  {
                    city 
                    ? <Xmark onClick={() => setCity('')} />
                    : <ChevronRight />
                  }
                </button>
              </div>
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2'>
            <ThreeButton data={metadata.used_types} state={used} setState={setUsed} />
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Qiymet</h3>
            <div>
              <TwoInputGroup 
                stateMin={minPrice} 
                setStateMin={setMinPrice}
                stateMax={maxPrice} 
                setStateMax={setMaxPrice}
                length={200} 
              />
            </div>
            <div className='flex items-center justify-between border-b py-2'>
              Senedli
              <CustomSwitch checked={document} setChecked={setDocument} />
            </div>
            <div className='flex items-center justify-between border-b py-2'>
              Kredit
              <CustomSwitch checked={credit} setChecked={setCredit} />
            </div>
            <div className='flex items-center justify-between border-b py-2'>
              Barter
              <CustomSwitch checked={barter} setChecked={setBarter} />
            </div>
            <div className='flex items-center justify-between'>
              Yeni
              <CustomSwitch checked={isNew} setChecked={setIsNew} />
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Ban novu</h3>
            <ButtonGroup data={metadata.categories} state={category} setState={setCategory} wrap isNew={false} />
          </div>
          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Muherrik</h3>
            <ButtonGroup data={metadata.fuel_types} state={fuelType} setState={setFuelType} wrap isNew={false} />
          </div>
          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Suretler qutusu</h3>
            <ButtonGroup data={metadata.transmissions} state={transmission} setState={setTransmission} wrap isNew={false} />
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Hecm</h3>
            <div className='flex flex-col'>
              <div className='flex items-center gap-3'>
                <span className='text-[17px]'>min.</span>
                <div className='flex flex-row flex-nowrap overflow-auto scrollbar-none gap-2'>
                  {
                    volumes.map((volume) => {
                      const active = volume === minVolume
                      return (
                        <button 
                          key={volume} 
                          onClick={() => setMinVolume(volume)} 
                          className={`border-2 rounded-full p-2 px-3 ${active && 'border-green-500 bg-green-200'}`}
                        >
                          {volume}
                        </button>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='flex items-center gap-3'>
                <span className='text-[17px]'>min.</span>
                <div className='flex flex-row flex-nowrap overflow-auto scrollbar-none gap-2'>
                  {
                    volumes.map((volume) => {
                      const active = volume === maxVolume
                      return (
                        <button 
                          key={volume} 
                          onClick={() => setMaxVolume(volume)} 
                          className={`border-2 rounded-full p-2 px-3 ${active && 'border-green-500 bg-green-200'}`}
                        >
                          {volume}
                        </button>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Muherrikin gucu</h3>
            <div>
              <TwoInputGroup 
                stateMin={minPower} 
                setStateMin={setMinPower}
                stateMax={maxPower} 
                setStateMax={setMaxPower}
                length={200} 
              />
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Buraxilis ili</h3>
            <div className='flex flex-col'>
              <div className='flex items-center gap-3'>
                <span className='text-[17px]'>min.</span>
                <div className='flex flex-row flex-nowrap overflow-auto scrollbar-none gap-2'>
                  {
                    years.map((year) => {
                      const active = year === minYear
                      return (
                        <button 
                          key={year} 
                          onClick={() => setMinYear(year)} 
                          className={`border-2 rounded-full p-2 px-3 ${active && 'border-green-500 bg-green-200'}`}
                        >
                          {year}
                        </button>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <div className='flex flex-col'>
              <div className='flex items-center gap-3'>
                <span className='text-[17px]'>min.</span>
                <div className='flex flex-row flex-nowrap overflow-auto scrollbar-none gap-2'>
                  {
                    years.map((year) => {
                      const active = year === maxYear
                      return (
                        <button 
                          key={year} 
                          onClick={() => setMaxYear(year)} 
                          className={`border-2 rounded-full p-2 px-3 ${active && 'border-green-500 bg-green-200'}`}
                        >
                          {year}
                        </button>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Yuruyush</h3>
            <div>
              <TwoInputGroup 
                stateMin={minDistance} 
                setStateMin={setMinDistance}
                stateMax={maxDistance} 
                setStateMax={setMaxDistance}
                length={200} 
              />
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Reng</h3>
            <ButtonGroup data={metadata.colors} state={color} setState={setColor} wrap={false} isNew={false} />
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Techizat</h3>
            <CheckboxButtons data={metadata.equipments} ids={equipment} onClick={addEquipment} />
          </div>

        </div>

        <div className='fixed bottom-0 left-0 p-3'>
          <button className='bg-green-500 p-3'>
            Axtar
          </button>
        </div>

        <DialogModal
          open={makeModalOpen}
          setOpen={setMakeModalOpen}
          state={make}
          setState={selectedMake}
          data={makes}
          label='Marka'
        />

        <DialogModal
          open={modelModalOpen}
          setOpen={setModelModalOpen}
          state={model}
          setState={selectedModel}
          data={models}
          label='Model'
        />

        <DialogModal
          open={cityModalOpen}
          setOpen={setCityModalOpen}
          state={city}
          setState={selectedCity}
          data={cities}
          label='Region'
        />


      </DialogContent>

      
    </Dialog>
  )
}

export default FilterModal