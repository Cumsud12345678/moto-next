'use client'
import { useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Funnel, Magnifier } from '@gravity-ui/icons'
import SearchAndSelect from '@/components/inputs/SearchAndSelect'
import ThreeButton from '@/components/buttons/ThreeButton'
import ButtonGroup from '@/components/buttons/ButtonGroup'
import CustomSwitch from '@/components/buttons/CustomSwitch'
import CustomDrawer from '@/components/CustomDrawer'
import TwoInputGroup from '../../(home)/_components/TwoInputGroup'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import { Default, Metadata } from '@/types/metadata'
import { useMetadata } from '@/hooks/useMetadata'

const CONDITION_TYPES = [
  { _id: 'c-new', label: 'Yeni', status: true },
  { _id: 'c-used', label: 'İşlənmiş', status: false },
]

const toCondition = (v: boolean | null) => (v === true ? 'new' : v === false ? 'used' : '')
const fromCondition = (v: string | null) => (v === 'new' ? true : v === 'used' ? false : null)

// Ehtiyat hissələri filtri — ana səhifədəki filtrlə eyni görünüş
const PartFilter = ({ metadata }: { metadata: Metadata }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [partCategory, setPartCategory] = useState(searchParams.get('partCategory') ?? '')
  const [make, setMake] = useState(searchParams.get('make') ?? '')
  const [model, setModel] = useState(searchParams.get('model') ?? '')
  const [condition, setCondition] = useState<boolean | null>(fromCondition(searchParams.get('condition')))
  const [region, setRegion] = useState(searchParams.get('region') ?? '')
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0)
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 0)
  const [delivery, setDelivery] = useState<boolean | null>(searchParams.get('delivery') === '1')

  const [makeOpen, setMakeOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  // Server-dən gələn metadata köhnə keşdirsə (kateqoriyalar yoxdursa), brauzerdən təzəsini götürürük
  const { metadata: fresh } = useMetadata()
  const categories = metadata.partCategories?.length ? metadata.partCategories : (fresh?.partCategories ?? [])
  const models = useMemo<Default[]>(
    () => (make ? metadata.models.filter((m) => m.make === make) : []),
    [make, metadata.models]
  )

  type Overrides = Partial<{ q: string, partCategory: string, make: string, model: string }>

  const apply = (o: Overrides = {}) => {
    const params = new URLSearchParams()
    const values: Record<string, string> = {
      q: (o.q ?? q).trim(),
      partCategory: o.partCategory ?? partCategory,
      make: o.make ?? make,
      model: (o.make !== undefined && o.make !== make) ? '' : (o.model ?? model),
      condition: toCondition(condition),
      region,
      minPrice: minPrice ? String(minPrice) : '',
      maxPrice: maxPrice ? String(maxPrice) : '',
      delivery: delivery ? '1' : '',
      sort: searchParams.get('sort') ?? '',
    }
    for (const [k, v] of Object.entries(values)) if (v) params.set(k, v)
    const qs = params.toString()
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname))
  }

  const reset = () => {
    setQ(''); setPartCategory(''); setMake(''); setModel(''); setCondition(null)
    setRegion(''); setMinPrice(0); setMaxPrice(0); setDelivery(false)
    startTransition(() => router.push(pathname))
  }

  const changeMake = (id: string) => {
    setMake(id)
    setModel('')
  }

  const searchInput = (
    <form
      onSubmit={(e) => { e.preventDefault(); apply() }}
      className='flex items-center bg-white border rounded-lg px-3 w-full'
    >
      <Magnifier className='size-5 text-gray-400 shrink-0' />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        maxLength={60}
        placeholder='Axtar, məs: porşen, kask'
        className='w-full p-3 outline-none bg-transparent'
        aria-label='Hissə axtar'
      />
    </form>
  )

  return (
    <div className='container mx-auto max-w-255'>
      {/* DESKTOP */}
      <div className='hidden lg:flex flex-col p-4 py-8 gap-4'>
        <div className='grid grid-cols-4 gap-4 items-center'>
          {searchInput}
          <SearchAndSelect data={categories} state={partCategory} setState={setPartCategory} label='Kateqoriya' />
          <SearchAndSelect data={metadata.makes} state={make} setState={(v) => changeMake(typeof v === 'function' ? v(make) : v)} label='Marka' />
          {
            make
            ? <SearchAndSelect data={models} state={model} setState={setModel} label='Model' />
            : <div className='border bg-gray-100 p-3 rounded'>Model</div>
          }
        </div>

        <div className='grid grid-cols-4 gap-4 items-center'>
          <ThreeButton data={CONDITION_TYPES} state={condition} setState={setCondition} />
          <SearchAndSelect data={metadata.cities} state={region} setState={setRegion} label='Şəhər' />
          <TwoInputGroup stateMin={minPrice} setStateMin={setMinPrice} stateMax={maxPrice} setStateMax={setMaxPrice} length={200} label='Qiymət min.' />
          <div className='flex items-center justify-between py-3 bg-white p-3 rounded-lg'>
            Çatdırılma var?
            <CustomSwitch checked={delivery} setChecked={setDelivery} />
          </div>
        </div>

        <div className='flex justify-end gap-4'>
          <button onClick={reset} className='flex items-center text-white text-lg bg-red-500 rounded-lg px-4.5 py-2'>
            Sıfırla
          </button>
          <button
            disabled={isPending}
            onClick={() => apply()}
            className={`text-white p-2.5 w-44 rounded-lg cursor-pointer shadow ${isPending ? 'bg-orange-300' : 'bg-orange-500'}`}
          >
            {isPending ? 'Axtarılır...' : 'Hissələri göstər'}
          </button>
        </div>
      </div>

      {/* MOBİL */}
      <div className='flex lg:hidden flex-col p-3 gap-3'>
        {searchInput}
        <div className='flex items-center justify-between gap-3'>
          <div onClick={() => setMakeOpen(true)} className='border p-2 px-3 w-full rounded-lg bg-white truncate'>
            {make ? metadata.makes.find((m) => m._id === make)?.label : 'Marka'}
          </div>
          <div
            onClick={() => {
              if (!make) return toast.add({ type: 'warning', description: 'İlk öncə marka seçin' })
              setModelOpen(true)
            }}
            className='border p-2 px-3 w-full rounded-lg bg-white truncate'
          >
            {model ? metadata.models.find((m) => m._id === model)?.label : 'Model'}
          </div>
          <div
            onClick={() => setMoreOpen(true)}
            className='border p-2 px-3 flex items-center text-white bg-blue-500 font-semibold justify-center gap-2 rounded-lg'
          >
            <Funnel />
            Filter
          </div>
        </div>
        {categories.length > 0 && (
          <div className='flex whitespace-nowrap scrollbar-none overflow-auto gap-2'>
            <ButtonGroup
              data={categories}
              state={partCategory}
              setState={(id) => { setPartCategory(id); apply({ partCategory: id }) }}
              wrap={true}
              isNew={false}
            />
          </div>
        )}
      </div>

      <CustomDrawer open={makeOpen} setOpen={setMakeOpen} state={make} setState={(id) => { changeMake(id); apply({ make: id, model: '' }) }} data={metadata.makes} label='Marka' />
      <CustomDrawer open={modelOpen} setOpen={setModelOpen} state={model} setState={(id) => { setModel(id); apply({ model: id }) }} data={models} label='Model' />

      <Drawer open={moreOpen} onOpenChange={setMoreOpen} showSwipeHandle>
        <DrawerContent className='h-[75%]'>
          <DrawerHeader>
            <DrawerTitle>Filter</DrawerTitle>
          </DrawerHeader>
          <div className='p-4 flex flex-col gap-4 overflow-auto'>
            <SearchAndSelect data={categories} state={partCategory} setState={setPartCategory} label='Kateqoriya' />
            <ThreeButton data={CONDITION_TYPES} state={condition} setState={setCondition} />
            <SearchAndSelect data={metadata.cities} state={region} setState={setRegion} label='Şəhər' />
            <TwoInputGroup stateMin={minPrice} setStateMin={setMinPrice} stateMax={maxPrice} setStateMax={setMaxPrice} length={200} label='Qiymət min.' />
            <div className='flex items-center justify-between py-3 bg-white border p-3 rounded-lg'>
              Çatdırılma var
              <CustomSwitch checked={delivery} setChecked={setDelivery} />
            </div>
          </div>
          <DrawerFooter>
            <div className='flex gap-3'>
              <button onClick={() => { reset(); setMoreOpen(false) }} className='flex-1 bg-red-500 text-white p-3 rounded-lg'>
                Sıfırla
              </button>
              <button onClick={() => { apply(); setMoreOpen(false) }} className='flex-2 bg-orange-500 text-white p-3 rounded-lg'>
                Hissələri göstər
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default PartFilter
