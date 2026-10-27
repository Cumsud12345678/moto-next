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
import { LISTING_STATUS_OPTIONS, ListingStatusBadge } from '../components/StatusBadge'
import { errorMessage } from '../_lib/utils'
import type { AdminListing, ListingStatus } from '../_lib/types'

// Status seçiləndə satıcıya göndəriləcək hazır mesaj (dəyişmək olar, boş qoymaq da olar)
const DEFAULT_MESSAGE: Partial<Record<ListingStatus, string>> = {
  active: 'Elanınız yoxlanıldı və sayta yerləşdirildi.',
  rejected: 'Elanınız saytın qaydalarına uyğun gəlmədiyi üçün rədd edildi.',
  blocked: 'Elanınız qaydaları pozduğu üçün bloklandı.',
}

interface StatusDialogProps {
  listing: Pick<AdminListing, '_id' | 'status'> | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  // Hissə elanları üçün: '/api/admin/parts/status'
  endpointBase?: string
}

export default function StatusDialog({ listing, onOpenChange, onSaved, endpointBase = '/api/admin/listings/edit/status' }: StatusDialogProps) {
  const [status, setStatus] = useState<ListingStatus>(listing?.status ?? 'active')
  const [message, setMessage] = useState('')
  const [notify, setNotify] = useState(true)
  const [saving, setSaving] = useState(false)

  const [lastId, setLastId] = useState(listing?._id)
  if (listing?._id !== lastId) {
    setLastId(listing?._id)
    setStatus(listing?.status ?? 'active')
    setMessage('')
    setNotify(true)
  }

  if (!listing) return null

  const changeStatus = (next: ListingStatus) => {
    setStatus(next)
    setMessage(DEFAULT_MESSAGE[next] ?? '')
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`${endpointBase}/${listing._id}`, {
        status,
        message: notify ? message.trim() : '',
      })
      toast.add({ type: 'success', description: data.message })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Status dəyişmədi') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Statusu dəyiş</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            İndiki status: <ListingStatusBadge status={listing.status} />
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {LISTING_STATUS_OPTIONS.map((o) => (
              <Button
                key={o.value}
                size="sm"
                variant={status === o.value ? 'default' : 'outline'}
                onClick={() => changeStatus(o.value as ListingStatus)}
              >
                {o.label}
              </Button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Satıcıya bildiriş göndər
          </label>

          {notify && (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Satıcının profilində görünəcək mesaj (boş qalsa göndərilmir)"
              rows={3}
              maxLength={300}
              className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-sky-500"
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            İmtina
          </Button>
          <Button onClick={save} disabled={saving || status === listing.status}>
            {saving ? 'Gözləyin...' : 'Yadda saxla'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
