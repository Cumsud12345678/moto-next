'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import ListingPagination from '@/components/ListingPagination'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { ToneBadge } from '../components/StatusBadge'
import { useAdminList } from '../_lib/useAdminList'
import { usePageParam } from '../_lib/usePageParam'
import { useUrlFilters } from '../_lib/useUrlFilters'
import { errorMessage, formatDateTime } from '../_lib/utils'

type Status = 'pending' | 'added' | 'rejected'

interface MakeRequest {
  _id: string
  text: string
  email: string | null
  status: Status
  notifiedAt: string | null
  user: { _id: string; name: string; email: string } | null
  createdAt: string
}

const ENDPOINT = '/api/admin/make-requests'

const STATUS_BADGE: Record<Status, { label: string; tone: 'yellow' | 'green' | 'gray' }> = {
  pending: { label: 'Gözləyir', tone: 'yellow' },
  added: { label: 'Əlavə olundu', tone: 'green' },
  rejected: { label: 'Rədd edildi', tone: 'gray' },
}

const TABS: { value: Status | 'all'; label: string }[] = [
  { value: 'pending', label: 'Gözləyənlər' },
  { value: 'added', label: 'Əlavə olunanlar' },
  { value: 'rejected', label: 'Rədd edilənlər' },
  { value: 'all', label: 'Hamısı' },
]

function MakeRequestsContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { values, setFilters } = useUrlFilters(['status'] as const)
  const status = (values.status || 'pending') as Status | 'all'

  const { data, isLoading, isError, isFetching } = useAdminList<MakeRequest, { pendingCount: number }>(
    ENDPOINT,
    page,
    20,
    status === 'all' ? {} : { status }
  )
  const pendingCount = data?.pendingCount

  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MakeRequest | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const changeStatus = async (id: string, next: Status) => {
    setBusyId(id)
    try {
      const { data } = await api.patch(`${ENDPOINT}/${id}`, { status: next })
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Status dəyişmədi') })
    } finally {
      setBusyId(null)
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`${ENDPOINT}/${deleteTarget._id}`)
      toast.add({ type: 'success', description: 'Silindi' })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
      throw err
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Marka sorğuları"
        description={
          <>
            İstifadəçilərin tapa bilmədiyi markalar. Markanı{' '}
            <Link href="/admin/metadata" className="text-sky-700 hover:underline">Marka, model</Link>{' '}
            səhifəsində əlavə edin, sonra burada &quot;Əlavə olundu&quot; basın — email yazan istifadəçiyə xəbər gedəcək.
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={status === t.value ? 'default' : 'outline'}
            onClick={() => setFilters({ status: t.value === 'pending' ? '' : t.value })}
          >
            {t.label}
            {t.value === 'pending' && pendingCount ? ` (${pendingCount})` : ''}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marka / model</TableHead>
              <TableHead>Xəbər veriləcək email</TableHead>
              <TableHead>Göndərən</TableHead>
              <TableHead>Tarix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Sorğu yoxdur" /></TableCell></TableRow>
            ) : (
              data.data.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-medium">{r.text}</TableCell>
                  <TableCell>
                    {r.email ?? <span className="text-muted-foreground">—</span>}
                    {r.notifiedAt && <div className="text-xs text-green-700">xəbər göndərildi</div>}
                  </TableCell>
                  <TableCell>
                    {r.user ? (
                      <Link href={`/admin/users?q=${encodeURIComponent(r.user.email)}`} className="hover:underline">
                        {r.user.name || r.user.email}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Qonaq</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTime(r.createdAt)}</TableCell>
                  <TableCell>
                    <ToneBadge tone={STATUS_BADGE[r.status].tone}>{STATUS_BADGE[r.status].label}</ToneBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      {r.status !== 'added' && (
                        <Button size="sm" disabled={busyId === r._id} onClick={() => changeStatus(r._id, 'added')}>
                          Əlavə olundu
                        </Button>
                      )}
                      {r.status === 'pending' && (
                        <Button size="sm" variant="outline" disabled={busyId === r._id} onClick={() => changeStatus(r._id, 'rejected')}>
                          Rədd et
                        </Button>
                      )}
                      {r.status !== 'pending' && (
                        <Button size="sm" variant="ghost" disabled={busyId === r._id} onClick={() => changeStatus(r._id, 'pending')}>
                          Geri al
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" disabled={busyId === r._id} onClick={() => setDeleteTarget(r)}>
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

      <ListingPagination currentPage={page} totalPages={data?.totalPages ?? 1} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Sorğu silinsin?"
        description={deleteTarget ? <><b>{deleteTarget.text}</b> sorğusu silinəcək.</> : undefined}
        confirmLabel="Sil"
        destructive
        onConfirm={remove}
      />
    </div>
  )
}

export default function MakeRequestsPage() {
  return (
    <Suspense fallback={null}>
      <MakeRequestsContent />
    </Suspense>
  )
}
