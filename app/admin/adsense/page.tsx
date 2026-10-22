'use client'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { ToneBadge } from '../components/StatusBadge'
import { daysLeft, errorMessage, formatDate, formatNumber, imageSrc } from '../_lib/utils'
import AdsenseDialog, { Adsense, POSITION_LABEL } from './adsense-dialog'

const QUERY_KEY = ['admin', 'adsense']

function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const left = daysLeft(expiresAt)
  if (left === null || left <= 0) return <ToneBadge tone="red">Bitib</ToneBadge>
  if (left <= 3) return <ToneBadge tone="orange">{left} gün qalıb</ToneBadge>
  return <ToneBadge tone="green">{left} gün qalıb</ToneBadge>
}

export default function AdsensePage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await api.get<{ data: Adsense[] }>('/api/adsense/all')).data.data,
  })

  const [dialog, setDialog] = useState<Adsense | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Adsense | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const activeCount = useMemo(() => (data ?? []).filter((a) => (daysLeft(a.adsenseExpiresAt) ?? 0) > 0).length, [data])

  const deleteAd = async () => {
    if (!deleteTarget) return
    try {
      const { data } = await api.delete(`/api/adsense/${deleteTarget._id}`)
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
      throw err
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Reklamlar"
        description={data ? `Aktiv: ${activeCount}, cəmi: ${data.length}. Vaxtı bitən reklamlar saytda göstərilmir.` : undefined}
        actions={<Button onClick={() => setDialog('new')}>+ Yeni reklam</Button>}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banner</TableHead>
              <TableHead>Sahibi</TableHead>
              <TableHead>Yerləşmə</TableHead>
              <TableHead className="text-right">Klik</TableHead>
              <TableHead>Müddət</TableHead>
              <TableHead className="text-right">Əməliyyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-14" /></TableCell></TableRow>
              ))
            ) : isError ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></TableCell></TableRow>
            ) : !data?.length ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Hələ reklam yoxdur" description='"Yeni reklam" düyməsi ilə əlavə edin' /></TableCell></TableRow>
            ) : (
              data.map((ad) => (
                <TableRow key={ad._id}>
                  <TableCell>
                    <a href={ad.link} target="_blank" rel="noreferrer" className="block w-48" title={ad.link}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- banner ölçüsü dəyişkəndir */}
                      <img src={imageSrc(ad.logo)} alt="" className="h-12 w-48 rounded-md bg-gray-100 object-cover" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ad.ownerName || '—'}</div>
                    <div className="text-xs text-muted-foreground">{ad.ownerPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{POSITION_LABEL[ad.position] ?? ad.position}</div>
                    <div className="text-xs text-muted-foreground">
                      {[ad.isHome && 'Ana səhifə', ad.isDetails && 'Elan səhifəsi'].filter(Boolean).join(', ') || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(ad.clickCount ?? 0)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <ExpiryBadge expiresAt={ad.adsenseExpiresAt} />
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(ad.adsenseExpiresAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" onClick={() => setDialog(ad)}>Redaktə</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(ad)}>Sil</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdsenseDialog ad={dialog} onOpenChange={(open) => !open && setDialog(null)} onSaved={refresh} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Reklam silinsin?"
        description={deleteTarget ? <><b>{deleteTarget.ownerName}</b> reklamı və şəkli silinəcək.</> : undefined}
        confirmLabel="Sil"
        destructive
        onConfirm={deleteAd}
      />
    </div>
  )
}
