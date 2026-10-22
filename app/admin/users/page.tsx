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
import SearchInput from '../components/SearchInput'
import FilterSelect from '../components/FilterSelect'
import { RoleBadge, ROLE_OPTIONS, ToneBadge } from '../components/StatusBadge'
import { useAdminList } from '../_lib/useAdminList'
import { usePageParam } from '../_lib/usePageParam'
import { useUrlFilters } from '../_lib/useUrlFilters'
import { errorMessage, formatDate, formatNumber } from '../_lib/utils'
import { AdminUser, MAX_WARNINGS } from '../_lib/types'
import ManageUserDialog from './manage-dialog'

const PAGE_SIZE = 20
const ENDPOINT = '/api/admin/users'
const FILTER_KEYS = ['q', 'role', 'status'] as const

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'warned', label: 'Xəbərdarlıq alanlar' },
  { value: 'blocked', label: 'Bloklananlar' },
]

function UserStatus({ user }: { user: AdminUser }) {
  if (user.isLocked) return <ToneBadge tone="red">Bloklanıb</ToneBadge>
  if (user.isWarning > 0) return <ToneBadge tone="orange">{user.isWarning}/{MAX_WARNINGS} xəbərdarlıq</ToneBadge>
  return <ToneBadge tone="green">Aktiv</ToneBadge>
}

function UsersContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { values, params, setFilters, clearFilters, hasFilters } = useUrlFilters(FILTER_KEYS)
  const { data, isLoading, isError, isFetching } = useAdminList<AdminUser>(ENDPOINT, page, PAGE_SIZE, params)

  const [manageUser, setManageUser] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)

  const deleteUser = async (reason: string) => {
    if (!deleteTarget) return
    try {
      const { data } = await api.delete(`/api/admin/users/${deleteTarget._id}`, { data: { reason } })
      toast.add({ type: 'success', description: data.message })
      queryClient.invalidateQueries({ queryKey: ['admin', ENDPOINT] })
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'İstifadəçi silinmədi') })
      throw err // pəncərə açıq qalsın
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="İstifadəçilər" description={data ? `Tapıldı: ${formatNumber(data.total)}` : undefined} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          value={values.q}
          onSearch={(q) => setFilters({ q })}
          placeholder="Ad, email, ID və ya IP"
        />
        <FilterSelect
          ariaLabel="Rol"
          value={values.role}
          onChange={(role) => setFilters({ role })}
          options={ROLE_OPTIONS}
          allLabel="Bütün rollar"
        />
        <FilterSelect
          ariaLabel="Status"
          value={values.status}
          onChange={(status) => setFilters({ status })}
          options={STATUS_OPTIONS}
          allLabel="Bütün statuslar"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Filtrləri təmizlə
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İstifadəçi</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Elan</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Qeydiyyat</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-9" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="İstifadəçi tapılmadı" description={hasFilters ? 'Filtrləri dəyişin' : undefined} />
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold uppercase text-gray-600">
                        {(u.name || u.email || '?').charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium">{u.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell><UserStatus user={u} /></TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.listingCount ? (
                      <Link href={`/admin/listings?seller=${u._id}`} className="text-sky-700 hover:underline">
                        {u.listingCount}
                      </Link>
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums text-muted-foreground">{u.ip || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(u.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => setManageUser(u)}>
                        İdarə et
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(u)}>
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

      <ManageUserDialog user={manageUser} onOpenChange={(open) => !open && setManageUser(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="İstifadəçi silinsin?"
        description={
          deleteTarget ? (
            <>
              <b>{deleteTarget.email}</b> hesabı və onun{' '}
              <b>{deleteTarget.listingCount ?? 0} elanı</b> silinəcək. Surəti &quot;Silinmiş istifadəçilər&quot;
              bölməsində qalacaq.
            </>
          ) : undefined
        }
        confirmLabel="Sil"
        destructive
        withReason
        reasonPlaceholder="Silinmə səbəbi (könüllü)"
        onConfirm={deleteUser}
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersContent />
    </Suspense>
  )
}
