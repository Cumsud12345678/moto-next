'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Status = 'pending' | 'added' | 'rejected'

interface MakeRequest {
  _id: string
  text: string
  email: string | null
  status: Status
  notifiedAt: string | null
  user: { _id: string; name: string; email: string } | null
  ip?: string
  createdAt: string
}

interface ListResponse {
  data: MakeRequest[]
  total: number
  pendingCount: number
  page: number
  totalPages: number
}

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Gözləyir',
  added: 'Əlavə olundu',
  rejected: 'Rədd edildi',
}

const STATUS_VARIANT: Record<Status, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  added: 'default',
  rejected: 'destructive',
}

const FILTERS: { value: '' | Status; label: string }[] = [
  { value: 'pending', label: 'Gözləyənlər' },
  { value: 'added', label: 'Əlavə olunanlar' },
  { value: 'rejected', label: 'Rədd edilənlər' },
  { value: '', label: 'Hamısı' },
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('az-AZ', { dateStyle: 'short', timeStyle: 'short' })

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

export default function MakeRequestsPage() {
  const [status, setStatus] = useState<'' | Status>('pending')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  // reloadKey dəyişəndə siyahı yenidən yüklənir
  const [reloadKey, setReloadKey] = useState(0)
  const load = useCallback(() => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (status) params.set('status', status)

    api.get<ListResponse>(`/api/admin/make-requests?${params}`)
      .then(({ data }) => {
        if (!cancelled) setResult(data)
      })
      .catch((err) => {
        if (!cancelled) toast.add({ type: 'error', description: errorMessage(err, 'Sorğular yüklənmədi') })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, status, reloadKey])

  const changeStatus = async (id: string, next: Status) => {
    setBusyId(id)
    try {
      const { data } = await api.patch(`/api/admin/make-requests/${id}`, { status: next })
      toast.add({ type: 'success', description: data.message })
      load()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Status dəyişmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    setBusyId(id)
    try {
      await api.delete(`/api/admin/make-requests/${id}`)
      toast.add({ type: 'success', description: 'Silindi' })
      load()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-4 w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Marka / model sorğuları</h1>
          <p className="text-sm text-gray-500">
            Gözləyən: {result?.pendingCount ?? '—'}. Markanı Make, Model səhifəsindən əlavə edib burada
            &quot;Əlavə olundu&quot; basın — email yazan istifadəçiyə xəbər gedəcək.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          Yenilə
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button
            key={f.value || 'all'}
            variant={status === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatus(f.value)
              setPage(1)
              setLoading(true)
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marka / model</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>İstifadəçi</TableHead>
              <TableHead>Tarix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !result ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Yüklənir...</TableCell>
              </TableRow>
            ) : !result?.data.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Sorğu yoxdur</TableCell>
              </TableRow>
            ) : (
              result.data.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.text}</TableCell>
                  <TableCell>
                    {r.email ?? <span className="text-gray-400">—</span>}
                    {r.notifiedAt && (
                      <span className="block text-xs text-green-600">xəbər göndərildi</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.user ? r.user.name || r.user.email : <span className="text-gray-400">qonaq</span>}
                  </TableCell>
                  <TableCell>{formatDate(r.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {r.status !== 'added' && (
                        <Button size="sm" disabled={busyId === r._id} onClick={() => changeStatus(r._id, 'added')}>
                          Əlavə olundu
                        </Button>
                      )}
                      {r.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === r._id}
                          onClick={() => changeStatus(r._id, 'rejected')}
                        >
                          Rədd et
                        </Button>
                      )}
                      {r.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === r._id}
                          onClick={() => changeStatus(r._id, 'pending')}
                        >
                          Geri al
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === r._id}
                        onClick={() => remove(r._id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setLoading(true); setPage((p) => p - 1) }}>
            Əvvəlki
          </Button>
          <span className="text-sm">
            {result.page} / {result.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= result.totalPages}
            onClick={() => { setLoading(true); setPage((p) => p + 1) }}
          >
            Növbəti
          </Button>
        </div>
      )}
    </div>
  )
}
