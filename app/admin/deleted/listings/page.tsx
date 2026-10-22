'use client'
import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import ListingPagination from '@/components/ListingPagination'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMetadata } from '@/hooks/useMetadata'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import JsonDialog from '../../components/JsonDialog'
import { ListingStatusBadge, RoleBadge } from '../../components/StatusBadge'
import { useAdminList } from '../../_lib/useAdminList'
import { usePageParam } from '../../_lib/usePageParam'
import { formatDateTime, formatNumber, formatPrice, imageSrc } from '../../_lib/utils'

interface DeletedListing {
  _id: string
  originalListingId: string
  // Silinmə anındakı elan (make/model burada sadəcə id-dir)
  snapshot: {
    make?: string
    model?: string
    price?: number
    year?: number
    images?: string[]
    status?: string
    seller?: string
    phone?: number
    createdAt?: string
  }
  deletedBy: { _id: string; name: string; email: string } | null
  deletedByRole: 'user' | 'admin' | 'system'
  deleteReason?: string
  viewCount?: number
  likedCount?: number
  createdAt: string
}

const PAGE_SIZE = 20

function DeletedListingsContent() {
  const page = usePageParam()
  const { data, isLoading, isError, isFetching } = useAdminList<DeletedListing>('/api/admin/listings/deleted', page, PAGE_SIZE)
  const { metadata } = useMetadata()
  const [selected, setSelected] = useState<DeletedListing | null>(null)

  // id -> ad (snapshot-da marka/model id kimi saxlanılır)
  const labels = useMemo(() => {
    const map = new Map<string, string>()
    metadata?.makes.forEach((m) => map.set(m._id, m.label))
    metadata?.models.forEach((m) => map.set(m._id, m.label))
    return map
  }, [metadata])

  const titleOf = (l: DeletedListing) =>
    [labels.get(String(l.snapshot?.make)), labels.get(String(l.snapshot?.model))].filter(Boolean).join(' ') || 'Elan'

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Silinmiş elanlar" description={data ? `Cəmi: ${data.total}` : undefined} />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elan</TableHead>
              <TableHead>Qiymət</TableHead>
              <TableHead>Son status</TableHead>
              <TableHead>Baxış / bəyənmə</TableHead>
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
                  <TableCell colSpan={8}><Skeleton className="h-12" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={8}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow><TableCell colSpan={8}><EmptyState title="Silinmiş elan yoxdur" /></TableCell></TableRow>
            ) : (
              data.data.map((l) => (
                <TableRow key={l._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image src={imageSrc(l.snapshot?.images?.[0])} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{titleOf(l)} {l.snapshot?.year ?? ''}</div>
                        <div className="text-xs text-muted-foreground">{l.originalListingId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(l.snapshot?.price)}</TableCell>
                  <TableCell><ListingStatusBadge status={l.snapshot?.status} /></TableCell>
                  <TableCell className="tabular-nums">{formatNumber(l.viewCount ?? 0)} / {formatNumber(l.likedCount ?? 0)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <RoleBadge role={l.deletedByRole} />
                      {l.deletedBy && <span className="text-xs text-muted-foreground">{l.deletedBy.name || l.deletedBy.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 truncate" title={l.deleteReason}>{l.deleteReason || '—'}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDateTime(l.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(l)}>Bax</Button>
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
        title={selected ? titleOf(selected) : ''}
        description={selected ? `Orijinal ID: ${selected.originalListingId}` : undefined}
        value={selected?.snapshot}
      />
    </div>
  )
}

export default function DeletedListingsPage() {
  return (
    <Suspense fallback={null}>
      <DeletedListingsContent />
    </Suspense>
  )
}
