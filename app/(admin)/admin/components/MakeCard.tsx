'use client'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/axios'
import { Minus, Plus, Xmark } from '@gravity-ui/icons'
import React, { useState } from 'react'

export interface Make {
  _id: string
  label: string
  logo: string
}

export interface ModelItem {
  _id: string
  label: string
  make: string
}

// .env.local: NEXT_PUBLIC_R2_URL=https://pub-xxxx.r2.dev  (sonda slash olmadan)
const R2_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''

const errMsg = (err: any) =>
  err?.response?.data?.message || err?.message || 'Xəta baş verdi'

interface MakeCardProps {
  make: Make
  models: ModelItem[]
  onChanged: () => Promise<void> | void
}

export default function MakeCard({ make, models, onChanged }: MakeCardProps) {
  // marka redaktəsi
  const [editingMake, setEditingMake] = useState(false)
  const [makeLabel, setMakeLabel] = useState(make.label)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // model redaktəsi
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  const [modelLabel, setModelLabel] = useState('')

  // yeni model
  const [newModel, setNewModel] = useState('')

  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      setBusy(true)
      await fn()
      toast.add({ type: 'success', description: success })
      await onChanged()
      return true
    } catch (err) {
      toast.add({ type: 'danger', description: errMsg(err) })
      return false
    } finally {
      setBusy(false)
    }
  }

  const cancelMakeEdit = () => {
    setEditingMake(false)
    setMakeLabel(make.label)
    setLogoFile(null)
  }

  const saveMake = async () => {
    if (!makeLabel.trim()) {
      return toast.add({ type: 'danger', description: 'Marka adını daxil edin' })
    }

    const formData = new FormData()
    formData.append('makeLabel', makeLabel.trim())
    if (logoFile) formData.append('logo', logoFile)

    const ok = await run(
      () => api.put(`/api/metadata/make/${make._id}`, formData),
      'Marka yeniləndi'
    )
    if (ok) {
      setEditingMake(false)
      setLogoFile(null)
    }
  }

  const deleteMake = async () => {
    if (!window.confirm(`"${make.label}" markası və bütün modelləri silinsin?`)) return
    await run(
      () => api.delete(`/api/metadata/make/${make._id}`),
      'Marka silindi'
    )
  }

  const startModelEdit = (model: ModelItem) => {
    setEditingModelId(model._id)
    setModelLabel(model.label)
  }

  const saveModel = async (modelId: string) => {
    if (!modelLabel.trim()) {
      return toast.add({ type: 'danger', description: 'Model adını daxil edin' })
    }
    const ok = await run(
      () => api.put(`/api/metadata/model/${modelId}`, { label: modelLabel.trim() }),
      'Model yeniləndi'
    )
    if (ok) setEditingModelId(null)
  }

  const deleteModel = async (model: ModelItem) => {
    if (!window.confirm(`"${model.label}" modeli silinsin?`)) return
    await run(
      () => api.delete(`/api/metadata/model/${model._id}`),
      'Model silindi'
    )
  }

  const addModel = async () => {
    if (!newModel.trim()) {
      return toast.add({ type: 'danger', description: 'Model adını daxil edin' })
    }
    const ok = await run(
      () =>
        api.post('/api/metadata/model', {
          makeId: make._id,
          modelLabels: [newModel.trim()],
        }),
      'Model əlavə olundu'
    )
    if (ok) setNewModel('')
  }

  return (
    <div className='border rounded-lg p-3 bg-white flex flex-col gap-3'>
      {/* Marka başlığı */}
      <div className='flex items-center gap-3'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${R2_URL}/${make.logo}`}
          alt={make.label}
          className='h-12 w-12 object-contain rounded border bg-gray-50'
        />

        {editingMake ? (
          <div className='flex flex-1 flex-wrap items-center gap-2'>
            <input
              value={makeLabel}
              onChange={(e) => setMakeLabel(e.target.value)}
              className='p-2 border rounded-lg bg-white'
              placeholder='Marka'
            />
            <input
              type='file'
              accept='image/png,image/jpeg,image/webp'
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className='text-xs'
            />
            <button
              disabled={busy}
              onClick={saveMake}
              className='px-3 py-2 bg-blue-500 text-white rounded-lg cursor-pointer disabled:opacity-50'
            >
              Yadda saxla
            </button>
            <button
              disabled={busy}
              onClick={cancelMakeEdit}
              className='px-3 py-2 bg-gray-200 rounded-lg cursor-pointer'
            >
              Ləğv et
            </button>
          </div>
        ) : (
          <>
            <h4 className='font-semibold flex-1'>
              {make.label}{' '}
              <span className='text-xs text-gray-500 font-normal'>({models.length} model)</span>
            </h4>
            <button
              disabled={busy}
              onClick={() => setEditingMake(true)}
              className='px-3 py-1 text-sm bg-gray-200 rounded-lg cursor-pointer'
            >
              Redaktə
            </button>
            <button
              disabled={busy}
              onClick={deleteMake}
              className='px-3 py-1 text-sm bg-red-500 text-white rounded-lg cursor-pointer disabled:opacity-50'
            >
              Sil
            </button>
          </>
        )}
      </div>

      {/* Modellər */}
      <ul className='flex flex-col gap-2 pl-2'>
        {models.length === 0 && (
          <li className='text-sm text-gray-500'>Bu marka üçün model yoxdur</li>
        )}

        {models.map((model) => (
          <li key={model._id} className='flex items-center gap-2'>
            {editingModelId === model._id ? (
              <>
                <input
                  value={modelLabel}
                  onChange={(e) => setModelLabel(e.target.value)}
                  className='p-1.5 border rounded-lg bg-white'
                />
                <button
                  disabled={busy}
                  onClick={() => saveModel(model._id)}
                  className='px-2 py-1 text-sm bg-blue-500 text-white rounded cursor-pointer disabled:opacity-50'
                >
                  Saxla
                </button>
                <button
                  onClick={() => setEditingModelId(null)}
                  className='p-1 cursor-pointer'
                  aria-label='Ləğv et'
                >
                  <Xmark className='size-5 text-gray-500' />
                </button>
              </>
            ) : (
              <>
                <span className='flex-1 text-sm'>{model.label}</span>
                <button
                  disabled={busy}
                  onClick={() => startModelEdit(model)}
                  className='px-2 py-1 text-xs bg-gray-200 rounded cursor-pointer'
                >
                  Redaktə
                </button>
                <button
                  disabled={busy}
                  onClick={() => deleteModel(model)}
                  className='p-1 bg-red-500 rounded cursor-pointer disabled:opacity-50'
                  aria-label='Modeli sil'
                >
                  <Minus className='size-4 text-white' />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Yeni model əlavə et */}
      <div className='flex items-center gap-2 pl-2'>
        <input
          value={newModel}
          onChange={(e) => setNewModel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addModel()}
          className='p-1.5 border rounded-lg bg-white'
          placeholder='Yeni model'
        />
        <button
          disabled={busy}
          onClick={addModel}
          className='p-2 bg-blue-500 rounded-sm cursor-pointer disabled:opacity-50'
          aria-label='Model əlavə et'
        >
          <Plus className='size-4 text-white' />
        </button>
      </div>
    </div>
  )
}