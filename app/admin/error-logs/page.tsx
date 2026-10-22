'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ErrorLog {
  _id: string
  source: 'request' | 'process' | 'job'
  statusCode: number
  name: string
  message: string
  method: string | null
  route: string | null
  url: string | null
  count: number
  firstSeen: string
  lastSeen: string
  resolved: boolean
}

interface ErrorLogDetail extends ErrorLog {
  stack: string
  body: unknown
  query: unknown
  ip: string | null
  userAgent: string | null
  user: { _id: string; name: string; email: string } | null
}

interface ListResponse {
  data: ErrorLog[]
  total: number
  openCount: number
  page: number
  totalPages: number
}

const FILTERS = [
  { value: 'false', label: 'Açıq' },
  { value: 'true', label: 'Həll edilmiş' },
  { value: '', label: 'Hamısı' },
] as const

const SOURCE_LABEL: Record<ErrorLog['source'], string> = {
  request: 'Sorğu',
  process: 'Proses',
  job: 'Fon işi',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('az-AZ', { dateStyle: 'short', timeStyle: 'medium' })

const errorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback

export default function ErrorLogsPage() {
  const [resolved, setResolved] = useState<'' | 'true' | 'false'>('false')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<ListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [detail, setDetail] = useState<ErrorLogDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // reloadKey dəyişəndə siyahı yenidən yüklənir
  const [reloadKey, setReloadKey] = useState(0)
  const load = useCallback(() => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (resolved) params.set('resolved', resolved)

    api.get<ListResponse>(`/api/admin/error-logs?${params}`)
      .then(({ data }) => {
        if (!cancelled) setResult(data)
      })
      .catch((err) => {
        if (!cancelled) toast.add({ type: 'error', description: errorMessage(err, 'Loqlar yüklənmədi') })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [page, resolved, reloadKey])

  const openDetail = async (id: string) => {
    setBusyId(id)
    try {
      const { data } = await api.get<{ data: ErrorLogDetail }>(`/api/admin/error-logs/${id}`)
      setDetail(data.data)
      setDetailOpen(true)
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Detallar yüklənmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const toggleResolved = async (id: string, value: boolean) => {
    setBusyId(id)
    try {
      await api.patch(`/api/admin/error-logs/${id}`, { resolved: value })
      toast.add({ type: 'success', description: value ? 'Həll edildi kimi qeyd olundu' : 'Yenidən açıldı' })
      setDetailOpen(false)
      load()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Dəyişmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id: string) => {
    setBusyId(id)
    try {
      await api.delete(`/api/admin/error-logs/${id}`)
      toast.add({ type: 'success', description: 'Silindi' })
      setDetailOpen(false)
      load()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const clearResolved = async () => {
    try {
      const { data } = await api.delete('/api/admin/error-logs/resolved')
      toast.add({ type: 'success', description: data.message })
      load()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
    }
  }

  // Sistemin işlədiyini yoxlamaq üçün: backend qəsdən xəta qaytarır, loq yaranmalıdır
  const createTestError = async () => {
    try {
      await api.post('/api/admin/error-logs/test')
    } catch {
      // 500 gözlənilir
    }
    toast.add({ type: 'success', description: 'Test xətası yaradıldı' })
    setResolved('false')
    setPage(1)
    setTimeout(load, 500)
  }

  return (
    <div className="p-4 w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Xəta loqları</h1>
          <p className="text-sm text-gray-500">
            Açıq xəta: {result?.openCount ?? '—'}. Eyni xəta təkrarlananda yeni sətir yaranmır, sayı artır.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={createTestError}>Test xətası</Button>
          <Button variant="outline" onClick={clearResolved}>Həll edilmişləri sil</Button>
          <Button variant="outline" onClick={load} disabled={loading}>Yenilə</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button
            key={f.value || 'all'}
            variant={resolved === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setResolved(f.value)
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
              <TableHead>Xəta</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Say</TableHead>
              <TableHead>Son dəfə</TableHead>
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
                <TableCell colSpan={6} className="text-center py-8">Xəta yoxdur 🎉</TableCell>
              </TableRow>
            ) : (
              result.data.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="max-w-90">
                    <div className="truncate font-medium" title={log.message}>{log.message}</div>
                    <div className="text-xs text-gray-500">
                      {log.statusCode} · {log.name} · {SOURCE_LABEL[log.source]}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.method && <span className="font-semibold">{log.method} </span>}
                    {log.route ?? '—'}
                  </TableCell>
                  <TableCell>{log.count}</TableCell>
                  <TableCell>{formatDate(log.lastSeen)}</TableCell>
                  <TableCell>
                    <Badge variant={log.resolved ? 'secondary' : 'destructive'}>
                      {log.resolved ? 'Həll edilib' : 'Açıq'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={busyId === log._id} onClick={() => openDetail(log._id)}>
                        Bax
                      </Button>
                      <Button
                        size="sm"
                        disabled={busyId === log._id}
                        onClick={() => toggleResolved(log._id, !log.resolved)}
                      >
                        {log.resolved ? 'Yenidən aç' : 'Həll edildi'}
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg wrap-break-word pr-6">{detail.message}</DialogTitle>
                <DialogDescription>
                  {detail.statusCode} · {detail.name} · {SOURCE_LABEL[detail.source]} · {detail.count} dəfə
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1 text-sm">
                <span className="text-gray-500">Route</span>
                <span className="font-mono break-all">{detail.method} {detail.route ?? '—'}</span>
                <span className="text-gray-500">Son URL</span>
                <span className="font-mono break-all">{detail.url ?? '—'}</span>
                <span className="text-gray-500">İlk dəfə</span>
                <span>{formatDate(detail.firstSeen)}</span>
                <span className="text-gray-500">Son dəfə</span>
                <span>{formatDate(detail.lastSeen)}</span>
                <span className="text-gray-500">İstifadəçi</span>
                <span>{detail.user ? `${detail.user.name} (${detail.user.email})` : '—'}</span>
                <span className="text-gray-500">IP</span>
                <span>{detail.ip ?? '—'}</span>
                <span className="text-gray-500">Brauzer</span>
                <span className="break-all text-xs">{detail.userAgent ?? '—'}</span>
              </div>

              {detail.query != null && Object.keys(detail.query as object).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Query</h4>
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(detail.query, null, 2)}
                  </pre>
                </div>
              )}

              {detail.body != null && Object.keys(detail.body as object).length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Body</h4>
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(detail.body, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-1">Stack</h4>
                <pre className="bg-gray-900 text-gray-100 rounded p-2 text-xs overflow-x-auto whitespace-pre">
                  {detail.stack || '—'}
                </pre>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="destructive" disabled={busyId === detail._id} onClick={() => remove(detail._id)}>
                  Sil
                </Button>
                <Button disabled={busyId === detail._id} onClick={() => toggleResolved(detail._id, !detail.resolved)}>
                  {detail.resolved ? 'Yenidən aç' : 'Həll edildi'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
