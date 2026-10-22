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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Listing } from '../../listings/columns'
import PageHeader from '../../components/PageHeader'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
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
  const [days, setDays] = useState('7')
  const [extending, setExtending] = useState(false)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', ENDPOINT] })

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

  const extendPremium = async () => {
    const day = parseInt(days, 10)
    if (!extendTarget || !day || day < 1 || day > 365) {
      return toast.add({ type: 'warning', description: '1 ilə 365 arasında gün yazın' })
    }
    setExtending(true)
    try {
      await api.put(`/api/admin/listings/urgent/${extendTarget._id}`, { day })
      toast.add({ type: 'success', description: `Premium ${day} gün təyin edildi` })
      setExtendTarget(null)
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Yenilənmədi') })
    } finally {
      setExtending(false)
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
                        onClick={() => {
                          setDays('7')
                          setExtendTarget(l)
                        }}
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

      <Dialog open={!!extendTarget} onOpenChange={(open) => !open && setExtendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premium müddəti</DialogTitle>
            <DialogDescription>
              Premium bu gündən başlayaraq yazdığınız gün qədər aktiv olacaq.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor="premium-days" className="text-sm">Gün sayı</label>
            <input
              id="premium-days"
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="rounded-lg border p-2 focus:outline-sky-500"
            />
            <div className="flex gap-2">
              {[1, 3, 7, 30].map((d) => (
                <Button key={d} size="sm" variant="outline" onClick={() => setDays(String(d))}>
                  {d} gün
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendTarget(null)} disabled={extending}>
              İmtina
            </Button>
            <Button onClick={extendPremium} disabled={extending}>
              {extending ? 'Gözləyin...' : 'Yadda saxla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
