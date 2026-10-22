'use client'
import { useState } from 'react'
import { Pencil, TrashBin, Xmark, Check } from '@gravity-ui/icons'

interface EditableItemProps {
  label: string
  // Neçə elanda istifadə olunur — 0-dan böyükdürsə silmək olmur
  usage?: number
  onRename: (label: string) => Promise<boolean>
  onDelete: () => void
}

// Siyahıdakı bir dəyər: ad, istifadə sayı, yerində redaktə və silmə
export default function EditableItem({ label, usage = 0, onRename, onDelete }: EditableItemProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!value.trim() || value.trim() === label) {
      setEditing(false)
      setValue(label)
      return
    }
    setSaving(true)
    const ok = await onRename(value.trim())
    setSaving(false)
    if (ok) setEditing(false)
  }

  const iconBtn = 'rounded p-1 text-muted-foreground hover:bg-gray-100 hover:text-foreground disabled:opacity-40'

  return (
    <li className="group flex min-h-9 items-center gap-2 rounded-md px-2 hover:bg-gray-50">
      {editing ? (
        <>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') {
                setEditing(false)
                setValue(label)
              }
            }}
            maxLength={60}
            className="h-8 flex-1 rounded-md border bg-white px-2 text-sm focus:outline-sky-500"
          />
          <button type="button" className={iconBtn} onClick={save} disabled={saving} aria-label="Yadda saxla">
            <Check className="size-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => {
              setEditing(false)
              setValue(label)
            }}
            aria-label="İmtina"
          >
            <Xmark className="size-4" />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{label}</span>
          <span className="text-xs tabular-nums text-muted-foreground" title="Bu dəyərdən istifadə edən elan sayı">
            {usage > 0 ? `${usage} elan` : ''}
          </span>
          <button type="button" className={iconBtn} onClick={() => setEditing(true)} aria-label={`${label} — adını dəyiş`}>
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            className={`${iconBtn} hover:text-red-600`}
            onClick={onDelete}
            disabled={usage > 0}
            title={usage > 0 ? `${usage} elanda istifadə olunur, silmək olmaz` : 'Sil'}
            aria-label={`${label} — sil`}
          >
            <TrashBin className="size-4" />
          </button>
        </>
      )}
    </li>
  )
}
