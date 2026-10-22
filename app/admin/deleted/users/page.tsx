'use client'
import { Suspense, useState } from 'react'
import ListingPagination from '@/components/ListingPagination'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import JsonDialog from '../../components/JsonDialog'
import { RoleBadge } from '../../components/StatusBadge'
import { useAdminList } from '../../_lib/useAdminList'
import { usePageParam } from '../../_lib/usePageParam'
import { formatDate, formatDateTime } from '../../_lib/utils'

interface DeletedUser {
  _id: string
  originalUserId: string
  snapshot: {
    name?: string
    email?: string
    role?: string
    ip?: string
    isWarning?: number
    createdAt?: string
  }
  deletedBy: { _id: string; name: string; email: string } | null
  deletedByRole: 'user' | 'admin' | 'system'
  deletedReason?: string
  createdAt: string
}

const PAGE_SIZE = 20

const reasonLabel = (reason?: string) => {
  if (!reason) return '—'
  if (reason.startsWith('merged_into:')) return 'Dublikat hesab birləşdirildi'
  return reason
}

function DeletedUsersContent() {
  const page = usePageParam()
  const { data, isLoading, isError, isFetching } = useAdminList<DeletedUser>('/api/admin/users/deleted', page, PAGE_SIZE)
  const [selected, setSelected] = useState<DeletedUser | null>(null)

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Silinmiş istifadəçilər"
        description={data ? `Cəmi: ${data.total}` : undefined}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İstifadəçi</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Qeydiyyat</TableHead>
              <TableHead>Kim sildi</TableHead>
              <TableHead>Səbəb</TableHead>
              <TableHead>Silinmə tarixi</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-8" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Silinmiş istifadəçi yoxdur" /></TableCell></TableRow>
            ) : (
              data.data.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="font-medium">{u.snapshot?.name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{u.snapshot?.email}</div>
                  </TableCell>
                  <TableCell><RoleBadge role={u.snapshot?.role} /></TableCell>
                  <TableCell>{formatDate(u.snapshot?.createdAt)}</TableCell>
                  <TableCell>
                    {u.deletedBy ? (
                      <span>{u.deletedBy.name || u.deletedBy.email}</span>
                    ) : (
                      <RoleBadge role={u.deletedByRole} />
                    )}
                  </TableCell>
                  <TableCell className="max-w-64 truncate" title={u.deletedReason}>{reasonLabel(u.deletedReason)}</TableCell>
                  <TableCell>{formatDateTime(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(u)}>Bax</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ListingPagination currentPage={page} totalPages={data?.totalPages ?? 1} />

      <JsonDialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.snapshot?.email || 'İstifadəçi'}
        description={selected ? `Orijinal ID: ${selected.originalUserId}` : undefined}
        value={selected?.snapshot}
      />
    </div>
  )
}

export default function DeletedUsersPage() {
  return (
    <Suspense fallback={null}>
      <DeletedUsersContent />
    </Suspense>
  )
}
