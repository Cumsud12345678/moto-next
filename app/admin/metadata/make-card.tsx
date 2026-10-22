'use client'
import { useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import type { Default } from '@/types/metadata'
import EditableItem from '../components/EditableItem'
import ImagePicker from '../components/ImagePicker'
import { errorMessage, imageSrc } from '../_lib/utils'

interface MakeCardProps {
  make: Default
  models: Default[]
  usage: { make: Record<string, number>; model: Record<string, number> }
  onChanged: () => void
  onConfirm: (opts: { title: string; description: React.ReactNode; action: () => Promise<void> }) => void
}

export default function MakeCard({ make, models, usage, onChanged, onConfirm }: MakeCardProps) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(make.label)
  const [logo, setLogo] = useState<File | null>(null)
  const [newModel, setNewModel] = useState('')
  const [busy, setBusy] = useState(false)

  const makeUsage = usage.make[make._id] ?? 0

  // Uğurlu olsa true qaytarır; xəta mesajını özü göstərir
  const run = async (request: () => Promise<{ data: { message: string } }>) => {
    setBusy(true)
    try {
      const { data } = await request()
      toast.add({ type: 'success', description: data.message })
      onChanged()
      return true
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err) })
      return false
    } finally {
      setBusy(false)
    }
  }

  const saveMake = async () => {
    if (!label.trim()) return toast.add({ type: 'warning', description: 'Marka adını yazın' })
    const fd = new FormData()
    fd.append('makeLabel', label.trim())
    if (logo) fd.append('logo', logo)
    if (await run(() => api.put(`/api/metadata/make/${make._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }))) {
      setEditing(false)
      setLogo(null)
    }
  }

  const addModel = async () => {
    if (!newModel.trim()) return
    if (await run(() => api.post('/api/metadata/model', { makeId: make._id, modelLabels: [newModel.trim()] }))) setNewModel('')
  }

  const askDeleteMake = () =>
    onConfirm({
      title: 'Marka silinsin?',
      description: <><b>{make.label}</b> markası və onun {models.length} modeli silinəcək.</>,
      action: async () => {
        if (!(await run(() => api.delete(`/api/metadata/make/${make._id}`)))) throw new Error()
      },
    })

  const askDeleteModel = (model: Default) =>
    onConfirm({
      title: 'Model silinsin?',
      description: <><b>{make.label} {model.label}</b> modeli silinəcək.</>,
      action: async () => {
        if (!(await run(() => api.delete(`/api/metadata/model/${model._id}`)))) throw new Error()
      },
    })

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-white p-3">
      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-9 rounded-lg border px-3 text-sm focus:outline-sky-500"
            placeholder="Marka adı"
          />
          <ImagePicker currentKey={make.logo} file={logo} onChange={setLogo} />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveMake} disabled={busy}>Yadda saxla</Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(false)
                setLabel(make.label)
                setLogo(null)
              }}
            >
              İmtina
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- loqolar svg də ola bilər */}
          <img src={imageSrc(make.logo)} alt="" className="size-11 rounded-lg border bg-gray-50 object-contain" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{make.label}</div>
            <div className="text-xs text-muted-foreground">
              {models.length} model{makeUsage > 0 ? ` · ${makeUsage} elan` : ''}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Redaktə</Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={askDeleteMake}
            disabled={makeUsage > 0}
            title={makeUsage > 0 ? `${makeUsage} elanda istifadə olunur, silmək olmaz` : undefined}
          >
            Sil
          </Button>
        </div>
      )}

      <ul className="flex max-h-64 flex-col overflow-y-auto">
        {models.length === 0 && <li className="px-2 py-1 text-sm text-muted-foreground">Model yoxdur</li>}
        {models.map((model) => (
          <EditableItem
            key={model._id}
            label={model.label}
            usage={usage.model[model._id]}
            onRename={(newLabel) => run(() => api.put(`/api/metadata/model/${model._id}`, { label: newLabel }))}
            onDelete={() => askDeleteModel(model)}
          />
        ))}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          addModel()
        }}
      >
        <input
          value={newModel}
          onChange={(e) => setNewModel(e.target.value)}
          placeholder="Yeni model"
          className="h-8 flex-1 rounded-md border px-2 text-sm focus:outline-sky-500"
        />
        <Button type="submit" size="sm" variant="outline" disabled={busy || !newModel.trim()}>
          Əlavə et
        </Button>
      </form>
    </div>
  )
}
