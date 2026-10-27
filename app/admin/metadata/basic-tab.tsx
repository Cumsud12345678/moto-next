'use client'
import { useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Default, Metadata } from '@/types/metadata'
import EditableItem from '../components/EditableItem'
import { errorMessage } from '../_lib/utils'
import type { Usage } from './use-metadata-admin'

type ConfirmFn = (opts: { title: string; description: React.ReactNode; action: () => Promise<void> }) => void

// dataModel: backend-in gözlədiyi ad; listKey: /api/metadata cavabındakı siyahı; usageKey: elandakı sahə
const GROUPS: { dataModel: string; listKey: keyof Metadata; usageKey: string; title: string; placeholder: string }[] = [
  { dataModel: 'city', listKey: 'cities', usageKey: 'region', title: 'Şəhərlər', placeholder: 'Məs: Gəncə' },
  { dataModel: 'category', listKey: 'categories', usageKey: 'category', title: 'Ban növləri', placeholder: 'Məs: Skuter' },
  { dataModel: 'color', listKey: 'colors', usageKey: 'color', title: 'Rənglər', placeholder: 'Məs: Göy' },
  { dataModel: 'fueltype', listKey: 'fuelTypes', usageKey: 'fuelType', title: 'Mühərrik növləri', placeholder: 'Məs: Elektrik' },
  { dataModel: 'transmission', listKey: 'transmissions', usageKey: 'transmission', title: 'Sürətlər qutusu', placeholder: 'Məs: Avtomat' },
  { dataModel: 'equipment', listKey: 'equipments', usageKey: 'equipment', title: 'Avadanlıqlar', placeholder: 'Məs: ABS' },
  { dataModel: 'partcategory', listKey: 'partCategories', usageKey: 'partCategory', title: 'Hissə kateqoriyaları', placeholder: 'Məs: Güzgülər' },
]

function BasicList({
  group,
  items,
  usage,
  onChanged,
  onConfirm,
}: {
  group: (typeof GROUPS)[number]
  items: Default[]
  usage: Record<string, number>
  onChanged: () => void
  onConfirm: ConfirmFn
}) {
  const [label, setLabel] = useState('')
  const [saving, setSaving] = useState(false)

  const add = async () => {
    if (!label.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post('/api/metadata', { dataModel: group.dataModel, dataLabel: label.trim() })
      toast.add({ type: 'success', description: data.message })
      setLabel('')
      onChanged()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Əlavə olunmadı') })
    } finally {
      setSaving(false)
    }
  }

  const rename = async (item: Default, newLabel: string) => {
    try {
      const { data } = await api.put('/api/metadata', { dataModel: group.dataModel, dataId: item._id, dataLabel: newLabel })
      toast.add({ type: 'success', description: data.message })
      onChanged()
      return true
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Yenilənmədi') })
      return false
    }
  }

  const askDelete = (item: Default) =>
    onConfirm({
      title: 'Silinsin?',
      description: <><b>{item.label}</b> &quot;{group.title}&quot; siyahısından silinəcək.</>,
      action: async () => {
        try {
          const { data } = await api.delete('/api/metadata', { data: { dataModel: group.dataModel, dataId: item._id } })
          toast.add({ type: 'success', description: data.message })
          onChanged()
        } catch (err) {
          toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
          throw err
        }
      },
    })

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-white p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold">{group.title}</h3>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <ul className="flex max-h-72 flex-col overflow-y-auto">
        {items.length === 0 && <li className="px-2 py-1 text-sm text-muted-foreground">Boşdur</li>}
        {[...items]
          .sort((a, b) => a.label.localeCompare(b.label, 'az'))
          .map((item) => (
            <EditableItem
              key={item._id}
              label={item.label}
              usage={usage[item._id]}
              onRename={(newLabel) => rename(item, newLabel)}
              onDelete={() => askDelete(item)}
            />
          ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={group.placeholder}
          maxLength={60}
          className="h-8 flex-1 rounded-md border px-2 text-sm focus:outline-sky-500"
        />
        <Button type="submit" size="sm" variant="outline" disabled={saving || !label.trim()}>
          Əlavə et
        </Button>
      </form>
    </div>
  )
}

export default function BasicTab({
  metadata,
  loading,
  usage,
  onChanged,
  onConfirm,
}: {
  metadata: Metadata | undefined
  loading: boolean
  usage: Usage
  onChanged: () => void
  onConfirm: ConfirmFn
}) {
  if (loading || !metadata) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {GROUPS.map((g) => <Skeleton key={g.dataModel} className="h-64 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {GROUPS.map((g) => (
        <BasicList
          key={g.dataModel}
          group={g}
          items={(metadata[g.listKey] as Default[]) ?? []}
          usage={usage[g.usageKey] ?? {}}
          onChanged={onChanged}
          onConfirm={onConfirm}
        />
      ))}
    </div>
  )
}
