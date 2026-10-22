'use client'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import { useQueryClient } from '@tanstack/react-query'
import ListingPagination from '@/components/ListingPagination'
import { api } from '@/lib/axios'
import { useMetadata } from '@/hooks/useMetadata'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
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
import PremiumDialog from '../components/PremiumDialog'
import SearchInput from '../components/SearchInput'
import FilterSelect from '../components/FilterSelect'
import { LISTING_STATUS_OPTIONS, ListingStatusBadge, ToneBadge } from '../components/StatusBadge'
import { useAdminList } from '../_lib/useAdminList'
import { usePageParam } from '../_lib/usePageParam'
import { useUrlFilters } from '../_lib/useUrlFilters'
import { errorMessage, formatDate, formatNumber, formatPrice, imageSrc } from '../_lib/utils'
import type { AdminListing } from '../_lib/types'
import ListingDetailDialog from './detail-dialog'
import StatusDialog from './status-dialog'

const PAGE_SIZE = 20
const ENDPOINT = '/api/admin/listings'
const FILTER_KEYS = ['q', 'status', 'isUrgent', 'make', 'seller'] as const

const PREMIUM_OPTIONS = [
  { value: 'true', label: 'Premium' },
  { value: 'false', label: 'Adi' },
]

const titleOf = (l: AdminListing) => `${l.make?.label ?? ''} ${l.model?.label ?? ''}`.trim() || 'Elan'

function ListingsContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { metadata } = useMetadata()
  const { values, params, setFilters, clearFilters, hasFilters } = useUrlFilters(FILTER_KEYS)
  const { data, isLoading, isError, isFetching } = useAdminList<AdminListing>(ENDPOINT, page, PAGE_SIZE, params)

  const [detail, setDetail] = useState<AdminListing | null>(null)
  const [statusTarget, setStatusTarget] = useState<AdminListing | null>(null)
  const [premiumTarget, setPremiumTarget] = useState<AdminListing | null>(null)
  const [removePremiumTarget, setRemovePremiumTarget] = useState<AdminListing | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminListing | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const deleteListing = async (message: string) => {
    if (!deleteTarget) return
    try {
      const { data } = await api.delete(`/api/admin/listings/${deleteTarget._id}`, { data: { message } })
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Elan silinmədi') })
      throw err
    }
  }

  const removePremium = async () => {
    if (!removePremiumTarget) return
    try {
      const { data } = await api.delete(`/api/admin/listings/urgent/${removePremiumTarget._id}`)
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Premium ləğv edilmədi') })
      throw err
    }
  }

  const makeOptions = (metadata?.makes ?? []).map((m) => ({ value: m._id, label: m.label }))

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Elanlar" description={data ? `Tapıldı: ${formatNumber(data.total)}` : undefined} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          value={values.q}
          onSearch={(q) => setFilters({ q })}
          placeholder="Elan ID, telefon və ya satıcı email"
        />
        <FilterSelect
          ariaLabel="Status"
          value={values.status}
          onChange={(status) => setFilters({ status })}
          options={LISTING_STATUS_OPTIONS}
          allLabel="Bütün statuslar"
        />
        <FilterSelect
          ariaLabel="Premium"
          value={values.isUrgent}
          onChange={(isUrgent) => setFilters({ isUrgent })}
          options={PREMIUM_OPTIONS}
          allLabel="Premium və adi"
        />
        <FilterSelect
          ariaLabel="Marka"
          value={values.make}
          onChange={(make) => setFilters({ make })}
          options={makeOptions}
          allLabel="Bütün markalar"
        />
        {values.seller && (
          <button
            type="button"
            onClick={() => setFilters({ seller: '' })}
            className="h-9 rounded-lg border border-sky-300 bg-sky-50 px-3 text-sm text-sky-900 hover:bg-sky-100"
          >
            Yalnız bir satıcının elanları ✕
          </button>
        )}
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
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-12" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="Elan tapılmadı" description={hasFilters ? 'Filtrləri dəyişin' : undefined} />
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((l) => (
                <TableRow key={l._id}>
                  <TableCell>
                    <button type="button" onClick={() => setDetail(l)} className="flex items-center gap-3 text-left">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image src={imageSrc(l.images?.[0])} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium hover:underline">
                          {titleOf(l)} {l.year}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {l.region?.label}
                          {l.isUrgent && <ToneBadge tone="orange">Premium</ToneBadge>}
                        </div>
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(l.price)}</TableCell>
                  <TableCell>
                    {l.seller ? (
                      <button
                        type="button"
                        onClick={() => setFilters({ seller: l.seller!._id })}
                        className="text-left hover:underline"
                        title="Bu satıcının bütün elanları"
                      >
                        <div>{l.seller.name || '—'}</div>
                        <div className="text-xs text-muted-foreground">{l.seller.email}</div>
                      </button>
                    ) : (
                      <span className="text-muted-foreground">Silinib</span>
                    )}
                  </TableCell>
                  <TableCell><ListingStatusBadge status={l.status} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(l.viewCount ?? 0)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(l.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => setDetail(l)}>
                        Bax
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button size="sm" variant="outline" aria-label="Digər əməliyyatlar" />}>
                          •••
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setStatusTarget(l)}>Statusu dəyiş</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPremiumTarget(l)}>
                            {l.isUrgent ? 'Premium müddətini dəyiş' : 'Premium et'}
                          </DropdownMenuItem>
                          {l.isUrgent && (
                            <DropdownMenuItem onClick={() => setRemovePremiumTarget(l)}>Premiumu ləğv et</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(l)}>
                            Sil
                          </DropdownMenuItem>
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

      {detail && <ListingDetailDialog listing={detail} onOpenChange={(open) => !open && setDetail(null)} />}

      {statusTarget && (
        <StatusDialog listing={statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)} onSaved={refresh} />
      )}

      <PremiumDialog
        listingId={premiumTarget?._id ?? null}
        title={premiumTarget ? titleOf(premiumTarget) : undefined}
        onOpenChange={(open) => !open && setPremiumTarget(null)}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={!!removePremiumTarget}
        onOpenChange={(open) => !open && setRemovePremiumTarget(null)}
        title="Premium ləğv edilsin?"
        description="Elan adi elan olacaq. Elan silinmir."
        confirmLabel="Bəli, ləğv et"
        destructive
        onConfirm={removePremium}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Elan silinsin?"
        description={
          deleteTarget ? (
            <>
              <b>{titleOf(deleteTarget)}</b> elanı, şəkilləri və videosu silinəcək. Surəti &quot;Silinmiş elanlar&quot;
              bölməsində qalacaq. Səbəb yazsanız, satıcıya bildiriş gedəcək.
            </>
          ) : undefined
        }
        confirmLabel="Sil"
        destructive
        withReason
        reasonPlaceholder="Səbəb (satıcıya göndərilir, könüllü)"
        onConfirm={deleteListing}
      />
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={null}>
      <ListingsContent />
    </Suspense>
  )
}
