'use client'
import Dropzone from '@/components/Dropzone'
import MakeCard, { Make, ModelItem } from '../components/MakeCard'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { useImageDrop } from '@/hooks/useImageDrop'
import { api } from '@/lib/axios'
import { Minus, Plus, Xmark } from '@gravity-ui/icons'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

interface ImageFile {
  id: string
  url: string
  file: File
}

const errMsg = (err: any) =>
  err?.response?.data?.message || err?.message || 'Xəta baş verdi'

async function createMakeAndModel(formData: FormData) {
  const res = await api.post('/api/metadata/make-and-model', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

async function fetchMetadata() {
  const res = await api.get('/api/metadata')
  return res.data.data as { makes: Make[]; models: ModelItem[] }
}

const MetadataPage = () => {
  // Şəkillərin sürüklə-burax ilə sıralanması
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const [make, setMake] = useState<string>('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [saving, setSaving] = useState(false)

  // Backenddən gələn siyahılar
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<ModelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const { removeImage, handleDrop } = useImageDrop({
    images,
    setImages,
    draggedIndex,
    setDraggedIndex,
    overIndex,
    setOverIndex,
  })

  const [stateModels, setStateModels] = useState<{ name: string }[]>([{ name: '' }])

  const loadMetadata = useCallback(async () => {
    try {
      const data = await fetchMetadata()
      setMakes(data.makes)
      setModels(data.models)
    } catch (err) {
      toast.add({ type: 'danger', description: errMsg(err) })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetadata()
  }, [loadMetadata])

  // makeId -> modellər
  const modelsByMake = useMemo(() => {
    const map = new Map<string, ModelItem[]>()
    for (const m of models) {
      const key = String(m.make)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return map
  }, [models])

  const filteredMakes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return makes
    return makes.filter(
      (mk) =>
        mk.label.toLowerCase().includes(q) ||
        (modelsByMake.get(mk._id) ?? []).some((m) => m.label.toLowerCase().includes(q))
    )
  }, [makes, modelsByMake, search])

  const addModel = () => setStateModels([...stateModels, { name: '' }])

  const removeModel = (index: number) =>
    setStateModels(stateModels.filter((_, i) => i !== index))

  const resetForm = () => {
    setMake('')
    images.forEach((img) => removeImage(img.id))
    setStateModels([{ name: '' }])
  }

  const setMakeModelForm = async () => {
    if (!make.trim()) {
      return toast.add({ type: 'danger', description: 'Marka adını daxil edin' })
    }
    if (images.length === 0) {
      return toast.add({ type: 'danger', description: 'Şəkil seçin' })
    }

    const formData = new FormData()
    formData.append('logo', images[0].file)
    formData.append('makeLabel', make.trim())
    formData.append(
      'modelLabels',
      JSON.stringify(
        stateModels.map((item) => item.name.trim()).filter((item) => item !== '')
      )
    )

    try {
      setSaving(true)
      await createMakeAndModel(formData)
      toast.add({ type: 'success', description: 'Marka və modellər əlavə olundu' })
      resetForm()
      await loadMetadata()
    } catch (err) {
      toast.add({ type: 'danger', description: errMsg(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='w-full flex flex-col xl:flex-row gap-5 p-5'>
      {/* Yeni marka & model */}
      <div className='bg-white p-3 rounded-lg w-full xl:max-w-[420px] h-fit'>
        <h3 className='font-semibold mb-2'>Marka & Model əlavə et</h3>
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          type='text'
          className='p-2 border rounded-lg bg-white w-full max-w-[300px]'
          placeholder='Marka'
        />

        {images.length === 0 ? (
          <div className='mt-2'>
            <Dropzone onDrop={handleDrop} />
          </div>
        ) : (
          <div className='bg-white p-3 rounded'>
            {images.slice(0, 1).map((img) => (
              <div key={img.id} className='relative w-fit'>
                <Image src={img.url} alt='' width={200} height={100} />
                <button
                  onClick={() => removeImage(img.id)}
                  className='absolute top-0 right-0 bg-gray-300 m-2 rounded-full cursor-pointer'
                >
                  <Xmark className='size-7 text-red-500' />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className='max-w-75 mt-2 flex flex-col gap-3'>
          <Label style={{ marginBottom: '-10px' }}>Model</Label>
          {stateModels.map((item, index) => (
            <div key={index} className='flex items-center justify-between gap-2'>
              <input
                value={item.name}
                onChange={(e) => {
                  const newModels = [...stateModels]
                  newModels[index] = { name: e.target.value }
                  setStateModels(newModels)
                }}
                type='text'
                className='p-2 border rounded-lg bg-white w-full'
                placeholder='Model'
              />
              <button onClick={addModel} className='cursor-pointer p-2 bg-blue-500 rounded-sm'>
                <Plus className='size-5 text-white' />
              </button>
              {stateModels.length >= 2 && (
                <button
                  onClick={() => removeModel(index)}
                  className='cursor-pointer p-2 bg-red-500 rounded-sm'
                >
                  <Minus className='size-5 text-white' />
                </button>
              )}
            </div>
          ))}

          <button
            disabled={saving}
            onClick={setMakeModelForm}
            className='w-full bg-blue-500 p-2 rounded-xl text-white mt-5 cursor-pointer disabled:opacity-50'
          >
            {saving ? 'Yadda saxlanılır...' : 'Yadda saxla'}
          </button>
        </div>
      </div>

      {/* Mövcud markalar və modellər */}
      <div className='bg-white p-3 rounded-lg w-full'>
        <div className='flex items-center justify-between gap-3 mb-3'>
          <h3 className='font-semibold'>
            Markalar <span className='text-sm text-gray-500 font-normal'>({makes.length})</span>
          </h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type='text'
            className='p-2 border rounded-lg bg-white w-full max-w-[260px]'
            placeholder='Marka və ya model axtar'
          />
        </div>

        {loading ? (
          <p className='text-sm text-gray-500'>Yüklənir...</p>
        ) : filteredMakes.length === 0 ? (
          <p className='text-sm text-gray-500'>Nəticə tapılmadı</p>
        ) : (
          <div className='grid gap-3 md:grid-cols-2'>
            {filteredMakes.map((mk) => (
              <MakeCard
                key={mk._id}
                make={mk}
                models={modelsByMake.get(mk._id) ?? []}
                onChanged={loadMetadata}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MetadataPage