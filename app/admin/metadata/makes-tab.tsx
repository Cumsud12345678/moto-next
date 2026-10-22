'use client'
import { useMemo, useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Default, Metadata } from '@/types/metadata'
import EmptyState from '../components/EmptyState'
import ImagePicker from '../components/ImagePicker'
import { errorMessage } from '../_lib/utils'
import MakeCard from './make-card'
import type { Usage } from './use-metadata-admin'

type ConfirmFn = (opts: { title: string; description: React.ReactNode; action: () => Promise<void> }) => void

interface MakesTabProps {
  metadata: Metadata | undefined
  loading: boolean
  usage: Usage
  onChanged: () => void
  onConfirm: ConfirmFn
}

function NewMakeForm({ onCreated }: { onCreated: () => void }) {
  const [label, setLabel] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [models, setModels] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!label.trim()) return toast.add({ type: 'warning', description: 'Marka adını yazın' })
    if (!logo) return toast.add({ type: 'warning', description: 'Logo seçin' })

    const fd = new FormData()
    fd.append('makeLabel', label.trim())
    fd.append('logo', logo)
    // Hər sətir bir model
    fd.append('modelLabels', JSON.stringify(models.split('\n').map((m) => m.trim()).filter(Boolean)))

    setSaving(true)
    try {
      const { data } = await api.post('/api/metadata/make-and-model', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.add({ type: 'success', description: data.message })
      setLabel('')
      setLogo(null)
      setModels('')
      onCreated()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Marka əlavə olunmadı') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-fit flex-col gap-3 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Yeni marka</h3>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Marka adı"
        className="h-9 rounded-lg border px-3 text-sm focus:outline-sky-500"
      />
      <ImagePicker file={logo} onChange={setLogo} hint="Loqo: kvadrat, şəffaf fonlu png və ya svg yaxşıdır" />
      <div>
        <label htmlFor="new-models" className="mb-1 block text-sm">Modellər (hər sətirdə bir model, könüllü)</label>
        <textarea
          id="new-models"
          value={models}
          onChange={(e) => setModels(e.target.value)}
          rows={4}
          placeholder={'NS200\nRS200\nDominar 400'}
          className="w-full rounded-lg border p-2 text-sm focus:outline-sky-500"
        />
      </div>
      <Button onClick={save} disabled={saving}>{saving ? 'Gözləyin...' : 'Markanı əlavə et'}</Button>
    </div>
  )
}

export default function MakesTab({ metadata, loading, usage, onChanged, onConfirm }: MakesTabProps) {
  const [search, setSearch] = useState('')

  const modelsByMake = useMemo(() => {
    const map = new Map<string, Default[]>()
    for (const m of metadata?.models ?? []) {
      const key = String(m.make)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return map
  }, [metadata])

  const makes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = metadata?.makes ?? []
    if (!q) return all
    return all.filter(
      (mk) =>
        mk.label.toLowerCase().includes(q) ||
        (modelsByMake.get(mk._id) ?? []).some((m) => m.label.toLowerCase().includes(q))
    )
  }, [metadata, modelsByMake, search])

  const usageMaps = { make: usage.make ?? {}, model: usage.model ?? {} }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
      <NewMakeForm onCreated={onChanged} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            {metadata ? `${metadata.makes.length} marka, ${metadata.models.length} model` : ''}
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Marka və ya model axtar"
            className="h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-sky-500 sm:w-72"
          />
        </div>

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : makes.length === 0 ? (
          <div className="rounded-xl border bg-white"><EmptyState title="Nəticə tapılmadı" /></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {makes.map((mk) => (
              <MakeCard
                key={`${mk._id}-${mk.label}-${mk.logo}`}
                make={mk}
                models={modelsByMake.get(mk._id) ?? []}
                usage={usageMaps}
                onChanged={onChanged}
                onConfirm={onConfirm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
