'use client'
import { Suspense, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import ListingPagination from '@/components/ListingPagination'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { ToneBadge } from '../components/StatusBadge'
import { useAdminList } from '../_lib/useAdminList'
import { usePageParam } from '../_lib/usePageParam'
import { useUrlFilters } from '../_lib/useUrlFilters'
import { errorMessage, formatDateTime, formatNumber } from '../_lib/utils'

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

const ENDPOINT = '/api/admin/error-logs'

const TABS = [
  { value: 'false', label: 'Açıq' },
  { value: 'true', label: 'Həll edilmiş' },
  { value: 'all', label: 'Hamısı' },
] as const

const SOURCE_LABEL: Record<ErrorLog['source'], string> = {
  request: 'Sorğu',
  process: 'Proses',
  job: 'Fon işi',
}

const hasKeys = (v: unknown) => !!v && typeof v === 'object' && Object.keys(v as object).length > 0

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all">{children ?? '—'}</span>
    </>
  )
}

function ErrorLogsContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { values, setFilters } = useUrlFilters(['resolved'] as const)
  const resolved = values.resolved || 'false'

  const { data, isLoading, isError, isFetching } = useAdminList<ErrorLog, { openCount: number }>(
    ENDPOINT,
    page,
    20,
    resolved === 'all' ? {} : { resolved }
  )

  const [busyId, setBusyId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ErrorLogDetail | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ErrorLog | null>(null)
  const [clearOpen, setClearOpen] = useState(false)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const openDetail = async (id: string) => {
    setBusyId(id)
    try {
      const { data } = await api.get<{ data: ErrorLogDetail }>(`${ENDPOINT}/${id}`)
      setDetail(data.data)
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Detallar yüklənmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const toggleResolved = async (log: ErrorLog) => {
    setBusyId(log._id)
    try {
      await api.patch(`${ENDPOINT}/${log._id}`, { resolved: !log.resolved })
      toast.add({ type: 'success', description: log.resolved ? 'Yenidən açıldı' : 'Həll edildi kimi qeyd olundu' })
      setDetail(null)
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Dəyişmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`${ENDPOINT}/${deleteTarget._id}`)
      toast.add({ type: 'success', description: 'Silindi' })
      setDetail(null)
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
      throw err
    }
  }

  const clearResolved = async () => {
    try {
      const { data } = await api.delete(`${ENDPOINT}/resolved`)
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
      throw err
    }
  }

  // Loqlamanın işlədiyini yoxlamaq üçün: backend qəsdən xəta qaytarır
  const createTestError = async () => {
    try {
      await api.post(`${ENDPOINT}/test`)
    } catch {
      // 500 gözlənilir
    }
    toast.add({ type: 'success', description: 'Test xətası yaradıldı' })
    setFilters({ resolved: '' })
    setTimeout(refresh, 500)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Xəta loqları"
        description="Backend-in server xətaları. Eyni xəta təkrarlananda yeni sətir yaranmır, sayı artır. 90 gün təkrarlanmayan loq avtomatik silinir."
        actions={
          <>
            <Button variant="outline" onClick={createTestError}>Test xətası</Button>
            <Button variant="outline" onClick={() => setClearOpen(true)}>Həll edilmişləri sil</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={resolved === t.value ? 'default' : 'outline'}
            onClick={() => setFilters({ resolved: t.value === 'false' ? '' : t.value })}
          >
            {t.label}
            {t.value === 'false' && data?.openCount ? ` (${data.openCount})` : ''}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Xəta</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="text-right">Say</TableHead>
              <TableHead>Son dəfə</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-9" /></TableCell></TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow><TableCell colSpan={6}><EmptyState title={resolved === 'false' ? 'Açıq xəta yoxdur 🎉' : 'Loq yoxdur'} /></TableCell></TableRow>
            ) : (
              data.data.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="max-w-96">
                    <button type="button" onClick={() => openDetail(log._id)} className="block max-w-full text-left">
                      <div className="truncate font-medium hover:underline" title={log.message}>{log.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.statusCode} · {log.name} · {SOURCE_LABEL[log.source]}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.method && <span className="font-semibold">{log.method} </span>}
                    <span className="break-all">{log.route ?? '—'}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(log.count)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTime(log.lastSeen)}</TableCell>
                  <TableCell>
                    {log.resolved ? <ToneBadge tone="gray">Həll edilib</ToneBadge> : <ToneBadge tone="red">Açıq</ToneBadge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" disabled={busyId === log._id} onClick={() => openDetail(log._id)}>Bax</Button>
                      <Button size="sm" disabled={busyId === log._id} onClick={() => toggleResolved(log)}>
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

      <ListingPagination currentPage={page} totalPages={data?.totalPages ?? 1} />

      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6 text-lg wrap-break-word">{detail.message}</DialogTitle>
                <DialogDescription>
                  {detail.statusCode} · {detail.name} · {SOURCE_LABEL[detail.source]} · {formatNumber(detail.count)} dəfə
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1 text-sm">
                <DetailRow label="Route">{detail.method} {detail.route}</DetailRow>
                <DetailRow label="Son URL">{detail.url}</DetailRow>
                <DetailRow label="İlk dəfə">{formatDateTime(detail.firstSeen)}</DetailRow>
                <DetailRow label="Son dəfə">{formatDateTime(detail.lastSeen)}</DetailRow>
                <DetailRow label="İstifadəçi">{detail.user ? `${detail.user.name} (${detail.user.email})` : null}</DetailRow>
                <DetailRow label="IP">{detail.ip}</DetailRow>
                <DetailRow label="Brauzer"><span className="text-xs">{detail.userAgent ?? '—'}</span></DetailRow>
              </div>

              {hasKeys(detail.query) && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Query</h4>
                  <pre className="overflow-x-auto rounded-lg bg-gray-100 p-2 text-xs">{JSON.stringify(detail.query, null, 2)}</pre>
                </div>
              )}
              {hasKeys(detail.body) && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Body</h4>
                  <pre className="overflow-x-auto rounded-lg bg-gray-100 p-2 text-xs">{JSON.stringify(detail.body, null, 2)}</pre>
                </div>
              )}
              <div>
                <h4 className="mb-1 text-sm font-semibold">Stack</h4>
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-2 text-xs text-gray-100">{detail.stack || '—'}</pre>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => setDeleteTarget(detail)}>Sil</Button>
                <Button disabled={busyId === detail._id} onClick={() => toggleResolved(detail)}>
                  {detail.resolved ? 'Yenidən aç' : 'Həll edildi'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Loq silinsin?"
        description="Xəta yenidən baş versə, yenidən yaranacaq."
        confirmLabel="Sil"
        destructive
        onConfirm={remove}
      />

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Həll edilmiş loqlar silinsin?"
        description="Həll edildi kimi qeyd olunan bütün loqlar silinəcək."
        confirmLabel="Sil"
        destructive
        onConfirm={clearResolved}
      />
    </div>
  )
}

export default function ErrorLogsPage() {
  return (
    <Suspense fallback={null}>
      <ErrorLogsContent />
    </Suspense>
  )
}
