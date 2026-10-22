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
import { errorMessage } from '../_lib/utils'

interface PremiumDialogProps {
  listingId: string | null
  title?: string
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

// Elana premium vermək və ya müddətini dəyişmək (bu gündən N gün)
export default function PremiumDialog({ listingId, title, onOpenChange, onSaved }: PremiumDialogProps) {
  const [days, setDays] = useState('7')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const day = parseInt(days, 10)
    if (!listingId || !day || day < 1 || day > 365) {
      return toast.add({ type: 'warning', description: '1 ilə 365 arasında gün yazın' })
    }
    setSaving(true)
    try {
      const { data } = await api.put(`/api/admin/listings/urgent/${listingId}`, { day })
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
    <Dialog
      open={!!listingId}
      onOpenChange={(open) => {
        if (open) setDays('7')
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Premium müddəti</DialogTitle>
          <DialogDescription>
            {title ? <b>{title}</b> : 'Elan'} bu gündən başlayaraq yazdığınız gün qədər premium olacaq.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <label htmlFor="premium-days" className="text-sm">Gün sayı</label>
          <input
            id="premium-days"
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="rounded-lg border p-2 focus:outline-sky-500"
          />
          <div className="flex gap-2">
            {[1, 3, 7, 30].map((d) => (
              <Button key={d} size="sm" variant={days === String(d) ? 'default' : 'outline'} onClick={() => setDays(String(d))}>
                {d} gün
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            İmtina
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Gözləyin...' : 'Yadda saxla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
