'use client'
import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Default } from '@/types/metadata'
import { useFilter } from '@/hooks/useFilter'
import ThreeButton from '@/components/buttons/ThreeButton'

import {ChevronRight, Xmark} from '@gravity-ui/icons';
import DialogModal from './DialogModal'
import TwoInputGroup from './TwoInputGroup'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import ButtonGroup from '@/components/buttons/ButtonGroup'
import CheckboxButtons from '@/components/buttons/CheckboxButtons'
import { useMetadata } from '@/hooks/useMetadata'
import { useRouter } from 'next/navigation'


interface FilterModalProps {
  open: boolean,
  data: ReturnType<typeof useFilter>
}

const FilterModal = ({open, data}: FilterModalProps) => {
  
  const metadataHook = useMetadata()
  const router = useRouter()

  const {
    make,
    setMake,
    model,
    setModel,
    used,
    setUsed,
    region,
    setRegion,
    
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,

    credit,
    setCredit,

    barter,
    setBarter,

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

    // equipment,
    // addEquipment,

    setElement,
    document,
    setDocument,
    category,
    setCategory,
  } = data

  const {
    isLoading,
    error,
    usedTypes,
    metadata
  } = metadataHook

  const [filteredModels, setFilteredModels] = useState<Array<Default>>([])

  useEffect(() => {
    if (make && metadata) {
      setFilteredModels(metadata.models.filter((model: Default) => model.make === make))
    } else if (!make) {
      setModel('')
      setFilteredModels([])
    }
  }, [make, metadata])

  const [makeModalOpen, setMakeModalOpen] = useState<boolean>(false)
  const [modelModalOpen, setModelModalOpen] = useState<boolean>(false)
  const [regionModalOpen, setRegionModalOpen] = useState<boolean>(false)

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

  const selectedRegion = (id: string) => {
    setRegion(id)
    setRegionModalOpen(false)
  }


  const applyFilter = () => {
    const params = new URLSearchParams()

    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (category) params.set('category', category);
    if (typeof used !== 'object') params.set('used', used ? '1' : '0');
    if (region) params.set('region', region);

    if (minPrice) params.set('minPrice', String(minPrice));
    if (maxPrice) params.set('maxPrice', String(maxPrice));

    if (document) params.set('document', '1');
    if (credit) params.set('credit', '1');
    if (barter) params.set('barter', '1');

    if (fuelType) params.set('fuelType', fuelType);
    if (transmission) params.set('transmission', transmission);
    if (color) params.set('color', color);

    if (minVolume) params.set('minVolume', String(minVolume));
    if (maxVolume) params.set('maxVolume', String(maxVolume));

    if (minDistance) params.set('minDistance', String(minDistance));
    if (maxDistance) params.set('maxDistance', String(maxDistance));

    if (minYear) params.set('minYear', String(minYear));
    if (maxYear) params.set('maxYear', String(maxYear));

    if (minPower) params.set('minPower', String(minPower));
    if (maxPower) params.set('maxPower', String(maxPower));

    // if (equipment.length) params.set('equipment', equipment.join(','));

    // window.history.back()

    router.push(`/motors?${params.toString()}`)
  }

  if(!metadata) {
    return (
      <div>
        {/* Burda skeleton */}
      </div>
    )
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
        showCloseButton={false}
        className='w-full h-full max-w-none! sm:w-full rounded-none flex flex-col bg-[#fbfbfb] p-0 overflow-hidden'
      >
        <DialogHeader className='h-auto px-3 mt-3 text-xl shrink-0 flex flex-row items-center justify-between'>
          Filterlər
          <Xmark 
            className='size-6 mt-2'
            onClick={() => window.history.back()}
          />
        </DialogHeader>

        <div className='flex flex-col gap-3 flex-1 overflow-y-auto'>
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
                      <span className='text-[17px] mt-4'>{metadata?.makes.find((item: Default) => item._id === make)?.label}</span>
                    </div>
                     : <span className='text-[17px]'>Bütün markalar</span>
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
                      <span className='text-[17px] mt-4'>{model ? metadata?.models.find((item: Default) => item._id === model)?.label : 'Bütün modeller'}</span>
                    </div>
                     : <span className='text-[17px]'>Bütün modeller</span>
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
                  onClick={() => setRegionModalOpen(true)} 
                  className='h-14 w-full flex items-center'
                >
                  {
                    region 
                    ? 
                    <div className='flex flex-col'>
                      <span className='text-gray-400 text-[13px] absolute top-2'>Region</span>
                      <span className='text-[17px] mt-4'>{region ? metadata?.cities.find((item: Default) => item._id === region)?.label : 'Bütün regionlar'}</span>
                    </div>
                     : <span className='text-[17px]' onClick={() => setRegionModalOpen(true)}>Bütün regionlar</span>
                  }
                </span>
                <button>
                  {
                    region 
                    ? <Xmark onClick={() => setRegion('')} />
                    : <ChevronRight />
                  }
                </button>
              </div>
            </div>
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2'>
            <ThreeButton data={usedTypes} state={used} setState={setUsed} />
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Qiymət</h3>
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
              Sənədli
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
            {/* <div className='flex items-center justify-between'>
              Yeni
              <CustomSwitch checked={isNew} setChecked={setIsNew} />
            </div> */}
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Ban növü</h3>
            <ButtonGroup data={metadata.categories} state={category} setState={setCategory} wrap={false} isNew={false} />
          </div>
          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Mühərrik</h3>
            <ButtonGroup data={metadata.fuelTypes} state={fuelType} setState={setFuelType} wrap={false} isNew={false} />
          </div>
          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Sürətlər qutusu</h3>
            <ButtonGroup data={metadata.transmissions} state={transmission} setState={setTransmission} wrap={false} isNew={false} />
          </div>

          <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Həcm</h3>
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
            <h3 className='text-xl'>Mühərrikin gücü</h3>
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
            <h3 className='text-xl'>Buraxılış ili</h3>
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
            <h3 className='text-xl'>Yürüyüş</h3>
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
            <h3 className='text-xl'>Rəng</h3>
            <ButtonGroup data={metadata.colors} state={color} setState={setColor} wrap={false} isNew={false} />
          </div>

          {/* <div className='p-3 rounded-lg flex flex-col gap-2 bg-white'>
            <h3 className='text-xl'>Techizat</h3>
            <CheckboxButtons data={metadata.equipments} ids={equipment} onClick={addEquipment} />
          </div> */}

        </div>

        {/* Şəffaf konteyner - yalnız padding üçün, arxası görünür */}
        <div className='shrink-0 px-3 pb-3'>
          <button onClick={applyFilter} className='bg-green-500 p-3 w-full rounded-lg text-white shadow-lg'>
            Axtar
          </button>
        </div>

        <DialogModal
          open={makeModalOpen}
          setOpen={setMakeModalOpen}
          state={make}
          setState={selectedMake}
          data={metadata.makes}
          label='Marka'
        />

        <DialogModal
          open={modelModalOpen}
          setOpen={setModelModalOpen}
          state={model}
          setState={selectedModel}
          data={filteredModels}
          label='Model'
        />

        <DialogModal
          open={regionModalOpen}
          setOpen={setRegionModalOpen}
          state={region}
          setState={selectedRegion}
          data={metadata.cities}
          label='Region'
        />


      </DialogContent>

      
    </Dialog>
  )
}

export default FilterModal