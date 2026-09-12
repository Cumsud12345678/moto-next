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
import TwoInputGroup from './TwoInputGroup'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import TwoSearchAndSelect from '@/components/inputs/numberType/TwoSearchAndSelect'
import CheckboxButtons from '@/components/buttons/CheckboxButtons'
import { useMetadata } from '@/hooks/useMetadata'
import { api } from '@/lib/axios'


async function getProducts() {
  const res = await api.get(
    '/api/listings',
    { withCredentials: true }
  )

  console.log(res.data)
}

getProducts()


const Filter = () => {

  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filterStates = useFilter()
  const metadataHook = useMetadata()

  const {
    make,
    setMake,
    model,
    setModel,
    used,
    setUsed,
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
    setEquipment,
    addEquipment,

    document,
    setDocument,
    category,
    setCategory,

  } = filterStates

  const {
    isLoading,
    error,
    usedTypes,
    metadata
  } = metadataHook

  const [filteredModels, setFilteredModels] = useState<Array<Default>>([])

  useEffect(() => {
    if(make && metadata) {
      setFilteredModels(metadata.models.filter((model: Default) => model.make === make))
    }else if(!make) {
      console.log('sifirladim')
      setModel('')
      setFilteredModels([])
    }
  }, [make, metadata])


  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false)

  const [makeModalOpen, setMakeModalOpen] = useState<boolean>(false)
  const [modelModalOpen, setModelModalOpen] = useState<boolean>(false)

  const [hash, setHash] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash)
    updateHash()
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth <= 1000
      setIsMobile(mobile)

      if (!mobile && window.location.hash === '#filter') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        setHash('')
      }
    }

    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  const openFilter = hash == '#filter' && isMobile


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


  const applyFilter = (overrides?: { make?: string; model?: string; category?: string }) => {
    const params = new URLSearchParams()

    const makeId = overrides?.make ?? make
    const modelId = overrides?.model ?? model
    const categoryId = overrides?.category ?? category

    if (makeId) params.set('make', makeId);
    if (modelId) params.set('model', modelId);
    if (categoryId) params.set('category', categoryId);
    if (typeof used !== 'object') params.set('used', used ? '1' : '0');
    if (city) params.set('city', city);

    if (minPrice) params.set('min_price', String(minPrice));
    if (maxPrice) params.set('max_price', String(maxPrice));

    if (document) params.set('document', '1');
    if (credit) params.set('credit', '1');
    if (barter) params.set('barter', '1');

    if (fuelType) params.set('fuel_type', fuelType);
    if (transmission) params.set('transmission', transmission);
    if (color) params.set('color', color);

    if (minVolume) params.set('min_volume', String(minVolume));
    if (maxVolume) params.set('max_volume', String(maxVolume));

    if (minDistance) params.set('min_distance', String(minDistance));
    if (maxDistance) params.set('max_distance', String(maxDistance));

    if (minYear) params.set('min_year', String(minYear));
    if (maxYear) params.set('max_year', String(maxYear));

    if (minPower) params.set('min_power', String(minPower));
    if (maxPower) params.set('max_power', String(maxPower));

    if (equipment.length) params.set('equipment', equipment.join(','));

    router.push(`/motors?${params.toString()}`)
  }


  useEffect(() => {
    if (pathname === '/motors') {
      setMake(searchParams.get('make') || '')
      setModel(searchParams.get('model') || '')
      setCategory(searchParams.get('category') || '')
      setCity(searchParams.get('city') || '')

      setMinPrice(Number(searchParams.get('min_price')) || 0)
      setMaxPrice(Number(searchParams.get('max_price')) || 0)

      const newUsed = searchParams.get('used')
      setUsed(newUsed === null ? null : newUsed === '1')
      
      setCredit(searchParams.get('credit') === '1')
      setBarter(searchParams.get('barter') === '1')
      setDocument(searchParams.get('document') === '1')

      setFuelType(searchParams.get('fuel_type') || '')
      setTransmission(searchParams.get('transmission') || '')
      setColor(searchParams.get('color') || '')

      setMinVolume(Number(searchParams.get('min_volume')) || 0)
      setMaxVolume(Number(searchParams.get('max_volume')) || 0)

      setMinDistance(Number(searchParams.get('min_distance')) || 0)
      setMaxDistance(Number(searchParams.get('max_distance')) || 0)

      setMinYear(Number(searchParams.get('min_year')) || 0)
      setMaxYear(Number(searchParams.get('max_year')) || 0)

      setMinPower(Number(searchParams.get('min_power')) || 0)
      setMaxPower(Number(searchParams.get('max_power')) || 0)

      const equipmentParam = searchParams.get('equipment')
      setEquipment(equipmentParam ? equipmentParam.split(',') : [])
    }
  }, [pathname])

  if(metadata) {
  
  return (
    <div className="container mx-auto max-w-255">
      <div className="hidden lg:flex flex-col p-4 py-8 gap-4">

        {/* 1-Cİ SƏTİR — HƏMİŞƏ SABİT */}
        <div className="flex items-center justify-between gap-5">
          <SearchAndSelect data={metadata.makes} state={make} setState={setMake} label="Marka" />
          <SearchAndSelect data={filteredModels} state={model} setState={setModel} label="Model" />
          <ThreeButton data={usedTypes} state={used} setState={setUsed} />
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


                <div className='rounded-lg flex flex-col gap-2'>
                  <SearchAndSelect data={metadata.fuelTypes} state={fuelType} setState={setFuelType} label="Yanacaq" />
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

            <div className='flex items-center justify-between py-2 bg-white p-3 rounded-lg flex-1'>
              Sened?
              <CustomSwitch checked={document} setChecked={setDocument} />
            </div>
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
        <div className='flex flex-col lg:hidden border p-3 gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <div onClick={() => setMakeModalOpen(true)} className='border p-2.5 px-3 w-full rounded-lg bg-white'>
              {make ? metadata.makes.find((item: Default) => item._id === make)?.label : 'Marka'}
            </div>
            <div onClick={() => setModelModalOpen(true)} className='border p-2.5 px-3 w-full rounded-lg bg-white'>
              {model ? metadata.models.find((item: Default) => item._id === model)?.label : 'Model'}
            </div>
            <div 
              onClick={() => window.location.hash = 'filter'}
              className='border p-2.5 px-3 flex items-center text-white bg-blue-500 font-semibold justify-center gap-2 rounded-lg'
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

      <CustomDrawer open={makeModalOpen} setOpen={setMakeModalOpen} state={make} setState={(id) => selectedMobileMake(id)} data={metadata.makes} label='Marka' />
      <CustomDrawer open={modelModalOpen} setOpen={setModelModalOpen} state={model} setState={(id) => selectedMobileModel(id)} data={filteredModels} label='Model' />

      <FilterModal open={openFilter} data={filterStates} />
    </div>
  
  )
  }
}

export default Filter