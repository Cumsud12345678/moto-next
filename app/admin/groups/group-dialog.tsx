'use client'
import { useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ImagePicker from '../components/ImagePicker'
import { errorMessage } from '../_lib/utils'

export interface Group {
  _id: string
  logo: string
  title: string
  link: string
  clickCount?: number
  createdAt?: string
}

interface GroupDialogProps {
  // null: bağlı, 'new': yeni qrup, Group: redaktə
  group: Group | 'new' | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const inputClass = 'h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-sky-500'

export default function GroupDialog({ group, onOpenChange, onSaved }: GroupDialogProps) {
  const editing = group && group !== 'new' ? group : null

  const [title, setTitle] = useState(editing?.title ?? '')
  const [link, setLink] = useState(editing?.link ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  // Başqa qrup açılanda formu doldur
  const [key, setKey] = useState(editing?._id ?? group)
  const currentKey = editing?._id ?? group
  if (currentKey !== key) {
    setKey(currentKey)
    setTitle(editing?.title ?? '')
    setLink(editing?.link ?? '')
    setFile(null)
  }

  const save = async () => {
    if (!title.trim()) return toast.add({ type: 'warning', description: 'Qrup adını yazın' })
    if (!/^https?:\/\//i.test(link.trim())) return toast.add({ type: 'warning', description: 'Link https:// ilə başlamalıdır' })
    if (!editing && !file) return toast.add({ type: 'warning', description: 'Logo seçin' })

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('link', link.trim())
    if (file) formData.append('logo', file)

    setSaving(true)
    try {
      const { data } = editing
        ? await api.put(`/api/groups/${editing._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/api/groups', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.add({ type: 'success', description: data.message })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Yadda saxlanmadı') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!group} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Qrupu redaktə et' : 'Yeni qrup'}</DialogTitle>
          <DialogDescription>Qruplar saytdakı &quot;Qruplar&quot; səhifəsində göstərilir.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="group-title" className="mb-1 block text-sm">Ad</label>
            <input id="group-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={inputClass} placeholder="Məs: Motosiklet həvəskarları" />
          </div>
          <div>
            <label htmlFor="group-link" className="mb-1 block text-sm">Link</label>
            <input id="group-link" value={link} onChange={(e) => setLink(e.target.value)} className={inputClass} placeholder="https://chat.whatsapp.com/..." />
          </div>
          <div>
            <span className="mb-1 block text-sm">Logo</span>
            <ImagePicker currentKey={editing?.logo} file={file} onChange={setFile} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>İmtina</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Gözləyin...' : 'Yadda saxla'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
