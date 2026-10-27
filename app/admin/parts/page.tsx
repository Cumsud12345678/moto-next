'use client'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import ListingPagination from '@/components/ListingPagination'
import { api } from '@/lib/axios'
import { useMetadata } from '@/hooks/useMetadata'
import { toast } from '@/components/ui/toast'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import SearchInput from '../components/SearchInput'
import FilterSelect from '../components/FilterSelect'
import { LISTING_STATUS_OPTIONS, ListingStatusBadge, ToneBadge } from '../components/StatusBadge'
import { useAdminList } from '../_lib/useAdminList'
import { usePageParam } from '../_lib/usePageParam'
import { useUrlFilters } from '../_lib/useUrlFilters'
import { errorMessage, formatDate, formatNumber, formatPrice, imageSrc } from '../_lib/utils'
import type { ListingStatus } from '../_lib/types'
import StatusDialog from '../listings/status-dialog'
import { partPath } from '@/lib/slug'
import type { Default } from '@/types/metadata'

interface AdminPart {
  _id: string
  title: string
  price: number
  images: string[]
  condition: 'new' | 'used'
  delivery?: boolean
  partCategory?: Default
  make?: Default
  model?: Default
  region?: Default
  phone: number
  description?: string
  seller: { _id: string; name: string; email: string; role: string } | null
  status: ListingStatus
  viewCount?: number
  likedCount?: number
  createdAt: string
}

const PAGE_SIZE = 20
const ENDPOINT = '/api/admin/parts'
const FILTER_KEYS = ['q', 'status', 'partCategory', 'seller'] as const

function PartsContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { metadata } = useMetadata()
  const { values, params, setFilters, clearFilters, hasFilters } = useUrlFilters(FILTER_KEYS)
  const { data, isLoading, isError, isFetching } = useAdminList<AdminPart>(ENDPOINT, page, PAGE_SIZE, params)

  const [statusTarget, setStatusTarget] = useState<AdminPart | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPart | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const deletePart = async (message: string) => {
    if (!deleteTarget) return
    try {
      const { data } = await api.delete(`${ENDPOINT}/${deleteTarget._id}`, { data: { message } })
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Elan silinmədi') })
      throw err
    }
  }

  const categoryOptions = (metadata?.partCategories ?? []).map((c) => ({ value: c._id, label: c.label }))

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Ehtiyat hissələri" description={data ? `Tapıldı: ${formatNumber(data.total)}` : undefined} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput value={values.q} onSearch={(q) => setFilters({ q })} placeholder="Ad, elan ID, telefon və ya email" />
        <FilterSelect ariaLabel="Status" value={values.status} onChange={(status) => setFilters({ status })} options={LISTING_STATUS_OPTIONS} allLabel="Bütün statuslar" />
        <FilterSelect ariaLabel="Kateqoriya" value={values.partCategory} onChange={(partCategory) => setFilters({ partCategory })} options={categoryOptions} allLabel="Bütün kateqoriyalar" />
        {values.seller && (
          <button
            type="button"
            onClick={() => setFilters({ seller: '' })}
            className="h-9 rounded-lg border border-sky-300 bg-sky-50 px-3 text-sm text-sky-900 hover:bg-sky-100"
          >
            Yalnız bir satıcının elanları ✕
          </button>
        )}
        {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Filtrləri təmizlə</Button>}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elan</TableHead>
              <TableHead>Qiymət</TableHead>
              <TableHead>Satıcı</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Baxış</TableHead>
              <TableHead>Tarix</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-12" /></TableCell></TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Hissə elanı tapılmadı" description={hasFilters ? 'Filtrləri dəyişin' : undefined} /></TableCell></TableRow>
            ) : (
              data.data.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image src={imageSrc(p.images?.[0])} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0 max-w-72">
                        <div className="font-medium truncate" title={p.title}>{p.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          {p.partCategory?.label}
                          {(p.make || p.model) && <span>· {[p.make?.label, p.model?.label].filter(Boolean).join(' ')}</span>}
                          <ToneBadge tone={p.condition === 'new' ? 'green' : 'gray'}>{p.condition === 'new' ? 'Yeni' : 'İşlənmiş'}</ToneBadge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(p.price)}</TableCell>
                  <TableCell>
                    {p.seller ? (
                      <button type="button" onClick={() => setFilters({ seller: p.seller!._id })} className="text-left hover:underline" title="Bu satıcının bütün hissə elanları">
                        <div>{p.seller.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{p.seller.email}</div>
                      </button>
                    ) : (
                      <span className="text-muted-foreground">Silinib</span>
                    )}
                  </TableCell>
                  <TableCell><ListingStatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(p.viewCount ?? 0)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(p.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      {p.status === 'active' && (
                        <Link href={partPath(p.title, p._id)} target="_blank" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
                          Bax
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button size="sm" variant="outline" aria-label="Digər əməliyyatlar" />}>
                          •••
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setStatusTarget(p)}>Statusu dəyiş</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>Sil</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ListingPagination currentPage={page} totalPages={data?.totalPages ?? 1} />

      {statusTarget && (
        <StatusDialog
          listing={statusTarget}
          endpointBase="/api/admin/parts/status"
          onOpenChange={(open) => !open && setStatusTarget(null)}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hissə elanı silinsin?"
        description={deleteTarget ? <><b>{deleteTarget.title}</b> elanı və şəkilləri silinəcək. Səbəb yazsanız, satıcıya bildiriş gedəcək.</> : undefined}
        confirmLabel="Sil"
        destructive
        withReason
        reasonPlaceholder="Səbəb (satıcıya göndərilir, könüllü)"
        onConfirm={deletePart}
      />
    </div>
  )
}

export default function AdminPartsPage() {
  return (
    <Suspense fallback={null}>
      <PartsContent />
    </Suspense>
  )
}
