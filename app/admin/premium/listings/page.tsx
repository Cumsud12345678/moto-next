'use client'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import ListingPagination from '@/components/ListingPagination'
import { api } from '@/lib/axios'
import { listingPath } from '@/lib/slug'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AdminListing as Listing } from '../../_lib/types'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import PremiumDialog from '../../components/PremiumDialog'
import { ListingStatusBadge, ToneBadge } from '../../components/StatusBadge'
import { useAdminList } from '../../_lib/useAdminList'
import { usePageParam } from '../../_lib/usePageParam'
import { daysLeft, errorMessage, formatDate, formatPrice, imageSrc } from '../../_lib/utils'

const PAGE_SIZE = 20
const ENDPOINT = '/api/admin/listings/urgent'

function RemainingBadge({ expiresAt }: { expiresAt?: string }) {
  const left = daysLeft(expiresAt)
  if (left === null) return <ToneBadge tone="gray">Müddətsiz</ToneBadge>
  if (left <= 0) return <ToneBadge tone="red">Bitib</ToneBadge>
  if (left <= 2) return <ToneBadge tone="orange">{left} gün qalıb</ToneBadge>
  return <ToneBadge tone="green">{left} gün qalıb</ToneBadge>
}

function PremiumListingsContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, isFetching } = useAdminList<Listing>(ENDPOINT, page, PAGE_SIZE)

  const [removeTarget, setRemoveTarget] = useState<Listing | null>(null)
  const [extendTarget, setExtendTarget] = useState<Listing | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const removePremium = async () => {
    if (!removeTarget) return
    try {
      const { data } = await api.delete(`/api/admin/listings/urgent/${removeTarget._id}`)
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Premium ləğv edilmədi') })
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Premium elanlar"
        description={data ? `Cəmi: ${data.total}. Premium vaxtı bitənlər qırmızı ilə göstərilir.` : undefined}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elan</TableHead>
              <TableHead>Qiymət</TableHead>
              <TableHead>Satıcı</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Müddət</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isFetching && !isLoading ? 'opacity-60' : ''}>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><Skeleton className="h-12" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.data.length ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Premium elan yoxdur" /></TableCell></TableRow>
            ) : (
              data.data.map((l) => (
                <TableRow key={l._id}>
                  <TableCell>
                    <Link
                      href={listingPath(l.make?.label, l.model?.label, l._id)}
                      target="_blank"
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <Image src={imageSrc(l.images?.[0])} alt="" fill unoptimized className="object-cover" />
                      </div>
                      <span className="font-medium">
                        {l.make?.label} {l.model?.label} {l.year}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(l.price)}</TableCell>
                  <TableCell>
                    <div>{l.seller?.name || '—'}</div>
                    <div className="text-xs text-muted-foreground">{l.seller?.email}</div>
                  </TableCell>
                  <TableCell><ListingStatusBadge status={l.status} /></TableCell>
                  <TableCell className="whitespace-nowrap">
                    <RemainingBadge expiresAt={l.urgentExpiresAt} />
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(l.urgentActiveAt)} → {formatDate(l.urgentExpiresAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExtendTarget(l)}
                      >
                        Müddəti dəyiş
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRemoveTarget(l)}>
                        Ləğv et
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
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Premium ləğv edilsin?"
        description={
          removeTarget
            ? `${removeTarget.make?.label ?? ''} ${removeTarget.model?.label ?? ''} elanı adi elan olacaq. Elan silinmir.`
            : undefined
        }
        confirmLabel="Bəli, ləğv et"
        destructive
        onConfirm={removePremium}
      />

      <PremiumDialog
        listingId={extendTarget?._id ?? null}
        title={extendTarget ? `${extendTarget.make?.label ?? ''} ${extendTarget.model?.label ?? ''}` : undefined}
        onOpenChange={(open) => !open && setExtendTarget(null)}
        onSaved={refresh}
      />
    </div>
  )
}

export default function PremiumListingsPage() {
  return (
    <Suspense fallback={null}>
      <PremiumListingsContent />
    </Suspense>
  )
}
