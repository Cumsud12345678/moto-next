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
import { errorMessage, formatDate } from '../_lib/utils'

export type AdPosition = 'mobile' | 'deskop_left' | 'deskop_right'

export interface Adsense {
  _id: string
  logo: string
  link: string
  position: AdPosition
  isHome: boolean
  isDetails: boolean
  clickCount: number
  adsenseExpiresAt: string
  ownerName: string
  ownerPhone: string
  createdAt?: string
}

export const POSITION_LABEL: Record<AdPosition, string> = {
  mobile: 'Mobil',
  deskop_left: 'Kompüter — sol',
  deskop_right: 'Kompüter — sağ',
}

interface AdsenseDialogProps {
  ad: Adsense | 'new' | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const inputClass = 'h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-sky-500'

export default function AdsenseDialog({ ad, onOpenChange, onSaved }: AdsenseDialogProps) {
  const editing = ad && ad !== 'new' ? ad : null

  const initial = () => ({
    link: editing?.link ?? '',
    position: (editing?.position ?? 'mobile') as AdPosition,
    isHome: editing?.isHome ?? true,
    isDetails: editing?.isDetails ?? false,
    ownerName: editing?.ownerName ?? '',
    ownerPhone: editing?.ownerPhone ?? '',
    // Redaktədə boş qalsa müddət dəyişmir
    day: editing ? '' : '30',
  })

  const [form, setForm] = useState(initial)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const currentKey = editing?._id ?? ad
  const [key, setKey] = useState(currentKey)
  if (currentKey !== key) {
    setKey(currentKey)
    setForm(initial())
    setFile(null)
  }

  const set = <K extends keyof ReturnType<typeof initial>>(k: K, v: ReturnType<typeof initial>[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!editing && !file) return toast.add({ type: 'warning', description: 'Reklam şəklini seçin' })
    if (!/^https?:\/\//i.test(form.link.trim())) return toast.add({ type: 'warning', description: 'Link https:// ilə başlamalıdır' })
    if (!form.ownerName.trim() || !form.ownerPhone.trim()) {
      return toast.add({ type: 'warning', description: 'Reklam sahibinin adını və telefonunu yazın' })
    }
    const day = parseInt(form.day, 10)
    if ((!editing || form.day) && (!day || day < 1 || day > 365)) {
      return toast.add({ type: 'warning', description: 'Gün sayı 1 ilə 365 arasında olmalıdır' })
    }

    const fd = new FormData()
    fd.append('link', form.link.trim())
    fd.append('position', form.position)
    fd.append('isHome', String(form.isHome))
    fd.append('isDetails', String(form.isDetails))
    fd.append('ownerName', form.ownerName.trim())
    fd.append('ownerPhone', form.ownerPhone.trim())
    if (form.day) fd.append('day', String(day))
    if (file) fd.append('logo', file)

    setSaving(true)
    try {
      const headers = { 'Content-Type': 'multipart/form-data' }
      const { data } = editing
        ? await api.put(`/api/adsense/${editing._id}`, fd, { headers })
        : await api.post('/api/adsense', fd, { headers })
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
    <Dialog open={!!ad} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Reklamı redaktə et' : 'Yeni reklam'}</DialogTitle>
          <DialogDescription>Hazırda saytda yalnız mobil reklamlar göstərilir (ana səhifə və axtarış nəticələri).</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <span className="mb-1 block text-sm">Şəkil (banner)</span>
            <ImagePicker currentKey={editing?.logo} file={file} onChange={setFile} aspect="wide" hint="Tövsiyə olunan ölçü: 960×240 və ya oxşar enli banner" />
          </div>

          <div>
            <label htmlFor="ad-link" className="mb-1 block text-sm">Link</label>
            <input id="ad-link" value={form.link} onChange={(e) => set('link', e.target.value)} className={inputClass} placeholder="https://..." />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="ad-position" className="mb-1 block text-sm">Yerləşmə</label>
              <select id="ad-position" value={form.position} onChange={(e) => set('position', e.target.value as AdPosition)} className={inputClass}>
                {Object.entries(POSITION_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ad-day" className="mb-1 block text-sm">
                {editing ? 'Müddəti yenilə (gün)' : 'Müddət (gün)'}
              </label>
              <input
                id="ad-day"
                type="number"
                min={1}
                max={365}
                value={form.day}
                onChange={(e) => set('day', e.target.value)}
                className={inputClass}
                placeholder={editing ? `Bitir: ${formatDate(editing.adsenseExpiresAt)}` : '30'}
              />
            </div>
          </div>
          {editing && <p className="-mt-2 text-xs text-muted-foreground">Gün yazsanız, müddət bu gündən yenidən hesablanır. Boş qalsa dəyişmir.</p>}

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isHome} onChange={(e) => set('isHome', e.target.checked)} />
              Ana səhifədə
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isDetails} onChange={(e) => set('isDetails', e.target.checked)} />
              Elan səhifəsində
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="ad-owner" className="mb-1 block text-sm">Reklam sahibi</label>
              <input id="ad-owner" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} maxLength={80} className={inputClass} />
            </div>
            <div>
              <label htmlFor="ad-phone" className="mb-1 block text-sm">Telefon</label>
              <input id="ad-phone" value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} maxLength={30} className={inputClass} placeholder="050 123 45 67" />
            </div>
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
