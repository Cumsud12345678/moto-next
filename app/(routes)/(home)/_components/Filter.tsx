'use client'
import ButtonGroup from '@/components/buttons/ButtonGroup'
import ThreeButton from '@/components/buttons/ThreeButton'
import SearchAndSelect from '@/components/inputs/SearchAndSelect'
import { useFilter } from '@/hooks/useFilter'
import {Funnel} from '@gravity-ui/icons';
import React, { useEffect, useState } from 'react'
import FilterModal from './FilterModal'
import CustomDrawer from '@/components/CustomDrawer'
import { Default } from '@/types/metadata'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import TwoInputGroup from './TwoInputGroup'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import NumberSearchAndSelect from '@/components/inputs/numberType/NumberSearchAndSelect'
import TwoSearchAndSelect from '@/components/inputs/numberType/TwoSearchAndSelect'
import CheckboxButtons from '@/components/buttons/CheckboxButtons'

const Filter = () => {

  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()

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

  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false)

  const [makeModalOpen, setMakeModalOpen] = useState<boolean>(false)
  const [modelModalOpen, setModelModalOpen] = useState<boolean>(false)

  const [hash, setHash] = useState<string>('')

  const openFilter = hash == '#filter' && window.innerWidth <= 1000

  // console.log(window.innerWidth)

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash)
    }

    updateHash()

    window.addEventListener('hashchange', updateHash)

    return () => {
      window.removeEventListener('hashchange', updateHash)
    }
    
  }, [])


  const applyFilter = (overrides?: { make?: string; model?: string; category?: string }) => {
    const params = new URLSearchParams()

    const makeId = overrides?.make ?? make
    const modelId = overrides?.model ?? model
    const categoryId = overrides?.category ?? category

    if (makeId) params.set('make', makeId)
    if (modelId) params.set('model', modelId)
    if (categoryId) params.set('category', categoryId)   // categoryId işlədildi

    router.push(`/motors?${params.toString()}`)
  }


  useEffect(() => {
    if(pathname === '/motors') {
      setMake(searchParams.get('make') || '')
      setModel(searchParams.get('model') || '')
      setCategory(searchParams.get('category') || '')
    }
  }, [pathname])


  const selectedMobileMake = (id: string) => {
    setMake(id)
    applyFilter({ make: id })
  }

  const selectedMobileModel = (id: string) => {
    setModel(id)
    applyFilter({ model: id })
  }

  const selectedMobileCategory = (id: string) => {
    setCategory(id)
    applyFilter({ category: id })
  }


  const [filterOpen, setFilterOpen] = useState<boolean>(false)

  
  return (
    <div className="container mx-auto max-w-255">
      <div className="hidden lg:flex flex-col p-4 py-8 gap-4">

        {/* 1-Cİ SƏTİR — HƏMİŞƏ SABİT */}
        <div className="flex items-center justify-between gap-5">
          <SearchAndSelect data={metadata.makes} state={make} setState={setMake} label="Marka" />
          <SearchAndSelect data={models} state={model} setState={setModel} label="Model" />
          <ThreeButton data={metadata.used_types} state={used} setState={setUsed} />
          <SearchAndSelect data={metadata.cities} state={city} setState={setCity} label="Weher" />
        </div>

        {/* 2-Cİ SƏTİR */}
        <div className="flex flex-col">

          {/* AÇILAN FILTERLƏR */}
          <div
            className={`
              grid transition-all duration-300 ease-in-out
              ${filterOpen
                ? "grid-rows-[1fr]"
                : "grid-rows-[0fr]"
              }
            `}
          >
            <div className={filterOpen ? "overflow-visible" : "overflow-hidden"}>
              <div className="grid grid-cols-4 gap-4 pb-4">

                {/* BURAYA İSTƏDİYİN ELEMENTLƏRİ QOY */}
                <TwoInputGroup
                  stateMin={minPrice}
                  setStateMin={setMinPrice}
                  stateMax={maxPrice}
                  setStateMax={setMaxPrice}
                  length={200}
                  label='Qiymet min.'
                />
                <div className='flex items-center justify-between py-2 bg-white p-3 rounded-lg'>
                  Kredit?
                  <CustomSwitch checked={credit} setChecked={setCredit} />
                </div>
                <div className='flex items-center justify-between py-2 bg-white p-3 rounded-lg'>
                  Barter?
                  <CustomSwitch checked={barter} setChecked={setBarter} />
                </div>
                <div className='flex items-center justify-between py-2 bg-white p-3 rounded-lg'>
                  Yeni?
                  <CustomSwitch checked={isNew} setChecked={setIsNew} />
                </div>


                <div className='rounded-lg flex flex-col gap-2'>
                  <SearchAndSelect data={metadata.fuel_types} state={fuelType} setState={setFuelType} label="Yanacaq" />
                </div>
                <div className='rounded-lg flex flex-col gap-2'>
                  <SearchAndSelect data={metadata.transmissions} state={transmission} setState={setTransmission} label="Suretler qutusu" />
                </div>
                <div className='rounded-lg flex flex-col gap-2'>
                  <TwoSearchAndSelect
                    data={years}
                    minState={minYear}
                    setMinState={setMinYear}
                    maxState={maxYear}
                    setMaxState={setMaxYear}
                    label='il min.'
                  />
                </div>
                <div className='rounded-lg flex flex-col gap-2'>
                  <TwoSearchAndSelect
                    data={volumes}
                    minState={minVolume}
                    setMinState={setMinVolume}
                    maxState={maxVolume}
                    setMaxState={setMaxVolume}
                    label='hecm min.'
                  />
                </div>


                <TwoInputGroup
                  stateMin={minPower}
                  setStateMin={setMinPower}
                  stateMax={maxPower}
                  setStateMax={setMaxPower}
                  length={200}
                  label='Guc min.'
                />
                <TwoInputGroup
                  stateMin={minDistance}
                  setStateMin={setMinDistance}
                  stateMax={maxDistance}
                  setStateMax={setMaxDistance}
                  length={200}
                  label='Yuruyush min.'
                />
                <div className='rounded-lg flex flex-col gap-2'>
                  <SearchAndSelect data={metadata.colors} state={color} setState={setColor} label="Reng" />
                </div>
              </div>

              <div className='rounded-lg flex flex-col gap-2 pb-5'>
                <h3 className='text-xl'>Techizat</h3>
                <CheckboxButtons data={metadata.equipments} ids={equipment} onClick={addEquipment} />
              </div>

            </div>
          </div>

          {/* SƏNİN 2-Cİ SƏTRİN */}
          <div className="flex items-center justify-between gap-4 z-20">

            <ThreeButton data={metadata.document} state={document} setState={setDocument} />
            <ButtonGroup data={metadata.categories} state={category} setState={setCategory} wrap={false} isNew={false} />

            <div className="flex gap-4 shrink-0">
              <button
                className="flex items-center text-orange-400 text-lg"
              >
                Sifirla
              </button>
              <button
                onClick={() => applyFilter()}
                className="bg-blue-500 text-white p-2.5 rounded-lg cursor-pointer shadow"
              >
                Elanlari gosder
              </button>
              <button
                onClick={() => setFilterOpen(prev => !prev)}
                className="bg-blue-500 text-white p-2.5 rounded-lg cursor-pointer shrink-0 shadow flex items-center gap-2"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='flex lg:hidden flex-col gap-4'>
        <div className='flex flex-col lg:hidden border p-4 gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <div onClick={() => setMakeModalOpen(true)} className='border p-3 w-full rounded-lg bg-white'>
              {make ? makes.find((item: Default) => item._id === make)?.label : 'Marka'}
            </div>
            <div onClick={() => setModelModalOpen(true)} className='border p-3 w-full rounded-lg bg-white'>
              {model ? models.find((item: Default) => item._id === model)?.label : 'Model'}
            </div>
            <div 
              onClick={() => window.location.hash = 'filter'}
              className='border p-3 flex items-center text-white bg-blue-500 font-semibold justify-center gap-2 rounded-lg'
            >
              <Funnel />
              Filter
            </div>
          </div>
          <div className='oflex whitespace-nowrap scrollbar-none overflow-auto gap-2 mask-[linear-gradient(to_right,black_85%,transparent)]'>
            <ButtonGroup data={metadata.categories} state={category} setState={selectedMobileCategory} wrap={true} isNew={false} />
          </div>
        </div>
      </div>

      <CustomDrawer open={makeModalOpen} setOpen={setMakeModalOpen} state={make} setState={(id) => selectedMobileMake(id)} data={makes} label='Marka' />
      <CustomDrawer open={modelModalOpen} setOpen={setModelModalOpen} state={model} setState={(id) => selectedMobileModel(id)} data={models} label='Model' />

      <FilterModal open={openFilter} />
    </div>
    
  )
}

export default Filter