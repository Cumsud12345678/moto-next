'use client'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import ListingPagination from '@/components/ListingPagination'
import { api } from '@/lib/axios'
import { listingPath } from '@/lib/slug'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import FilterSelect from '../components/FilterSelect'
import { ListingStatusBadge, ToneBadge } from '../components/StatusBadge'
import { useAdminList } from '../_lib/useAdminList'
import { usePageParam } from '../_lib/usePageParam'
import { useUrlFilters } from '../_lib/useUrlFilters'
import { errorMessage, formatDateTime, imageSrc } from '../_lib/utils'

type ReportStatus = 'new' | 'reviewed' | 'dismissed'
type ReportCategory = 'fraud' | 'wrong_info' | 'sold' | 'duplicate' | 'inappropriate' | 'other'

interface Report {
  _id: string
  category: ReportCategory
  message: string
  email: string
  status: ReportStatus
  adminNote?: string
  createdAt: string
  handledAt?: string | null
  user: { _id: string; name: string; email: string } | null
  listingReportCount: number
  listing: {
    _id: string
    make?: { label: string }
    model?: { label: string }
    year?: number
    price?: number
    images?: string[]
    status?: string
    seller?: { _id: string; name: string; email: string } | null
  } | null
}

const ENDPOINT = '/api/admin/reports'

const CATEGORY: Record<ReportCategory, { label: string; tone: 'red' | 'orange' | 'yellow' | 'blue' | 'gray' }> = {
  fraud: { label: 'Dolandırıcılıq', tone: 'red' },
  wrong_info: { label: 'Səhv məlumat', tone: 'orange' },
  sold: { label: 'Satılıb', tone: 'blue' },
  duplicate: { label: 'Təkrar elan', tone: 'yellow' },
  inappropriate: { label: 'Uyğunsuz məzmun', tone: 'orange' },
  other: { label: 'Digər', tone: 'gray' },
}

const STATUS_TABS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'new', label: 'Yeni' },
  { value: 'reviewed', label: 'Tədbir görülüb' },
  { value: 'dismissed', label: 'Əsassız' },
  { value: 'all', label: 'Hamısı' },
]

const CATEGORY_OPTIONS = Object.entries(CATEGORY).map(([value, c]) => ({ value, label: c.label }))

const titleOf = (l: Report['listing']) =>
  l ? `${l.make?.label ?? ''} ${l.model?.label ?? ''} ${l.year ?? ''}`.trim() || 'Elan' : 'Elan silinib'

function ReportsContent() {
  const page = usePageParam()
  const queryClient = useQueryClient()
  const { values, setFilters } = useUrlFilters(['status', 'category', 'listing'] as const)
  const status = (values.status || 'new') as ReportStatus | 'all'

  const params: Record<string, string> = {}
  if (status !== 'all') params.status = status
  if (values.category) params.category = values.category
  if (values.listing) params.listing = values.listing

  const { data, isLoading, isError, isFetching } = useAdminList<Report, { newCount: number }>(ENDPOINT, page, 20, params)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [blockTarget, setBlockTarget] = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] })

  const setStatus = async (r: Report, next: ReportStatus) => {
    setBusyId(r._id)
    try {
      const { data } = await api.patch(`${ENDPOINT}/${r._id}`, { status: next })
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Dəyişmədi') })
    } finally {
      setBusyId(null)
    }
  }

  // Elanı bloklayır, satıcıya bildiriş göndərir və bu elanın bütün yeni şikayətlərini bağlayır
  const blockListing = async (reason: string) => {
    if (!blockTarget?.listing) return
    const listingId = blockTarget.listing._id
    try {
      await api.put(`/api/admin/listings/edit/status/${listingId}`, {
        status: 'blocked',
        message: reason || 'Elanınız istifadəçi şikayətlərinə əsasən yoxlanıldı və bloklandı.',
      })
      const { data } = await api.patch(`${ENDPOINT}/listing/${listingId}`, { status: 'reviewed' })
      toast.add({ type: 'success', description: `Elan bloklandı. ${data.message}` })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Elan bloklanmadı') })
      throw err
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    try {
      const { data } = await api.delete(`${ENDPOINT}/${deleteTarget._id}`)
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
        title="Şikayətlər"
        description="İstifadəçilərin elanlar barədə şikayətləri. Eyni elana bir neçə şikayət gəlibsə, sayı qırmızı ilə göstərilir."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((t) => (
          <Button
            key={t.value}
            size="sm"
            variant={status === t.value ? 'default' : 'outline'}
            onClick={() => setFilters({ status: t.value === 'new' ? '' : t.value })}
          >
            {t.label}
            {t.value === 'new' && data?.newCount ? ` (${data.newCount})` : ''}
          </Button>
        ))}
        <FilterSelect
          ariaLabel="Növ"
          value={values.category}
          onChange={(category) => setFilters({ category })}
          options={CATEGORY_OPTIONS}
          allLabel="Bütün növlər"
        />
        {values.listing && (
          <button
            type="button"
            onClick={() => setFilters({ listing: '' })}
            className="h-9 rounded-lg border border-sky-300 bg-sky-50 px-3 text-sm text-sky-900 hover:bg-sky-100"
          >
            Yalnız bir elanın şikayətləri ✕
          </button>
        )}
      </div>

      <div className={`flex flex-col gap-3 ${isFetching && !isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : isError ? (
          <div className="rounded-xl border bg-white"><EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" /></div>
        ) : !data?.data.length ? (
          <div className="rounded-xl border bg-white">
            <EmptyState title={status === 'new' ? 'Yeni şikayət yoxdur 🎉' : 'Şikayət yoxdur'} />
          </div>
        ) : (
          data.data.map((r) => (
            <div key={r._id} className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">
              {/* Elan */}
              <div className="flex min-w-0 gap-3 md:w-72 md:shrink-0">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {r.listing && <Image src={imageSrc(r.listing.images?.[0])} alt="" fill unoptimized className="object-cover" />}
                </div>
                <div className="min-w-0">
                  {r.listing ? (
                    <Link
                      href={listingPath(r.listing.make?.label, r.listing.model?.label, r.listing._id)}
                      target="_blank"
                      className="font-medium hover:underline"
                    >
                      {titleOf(r.listing)} ↗
                    </Link>
                  ) : (
                    <span className="font-medium text-muted-foreground">Elan silinib</span>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {r.listing?.status && <ListingStatusBadge status={r.listing.status} />}
                    {r.listingReportCount > 1 && (
                      <button type="button" onClick={() => setFilters({ listing: r.listing!._id })} title="Bu elanın bütün şikayətləri">
                        <ToneBadge tone="red">{r.listingReportCount} yeni şikayət</ToneBadge>
                      </button>
                    )}
                  </div>
                  {r.listing?.seller && (
                    <Link
                      href={`/admin/users?q=${encodeURIComponent(r.listing.seller.email)}`}
                      className="mt-1 block truncate text-xs text-muted-foreground hover:underline"
                    >
                      Satıcı: {r.listing.seller.name || r.listing.seller.email}
                    </Link>
                  )}
                </div>
              </div>

              {/* Şikayət */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ToneBadge tone={CATEGORY[r.category]?.tone ?? 'gray'}>{CATEGORY[r.category]?.label ?? r.category}</ToneBadge>
                  {r.status === 'reviewed' && <ToneBadge tone="green">Tədbir görülüb</ToneBadge>}
                  {r.status === 'dismissed' && <ToneBadge tone="gray">Əsassız</ToneBadge>}
                  <span className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</span>
                </div>
                {r.message ? (
                  <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Əlavə izah yazılmayıb</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Göndərən:{' '}
                  <a href={`mailto:${r.email}`} className="text-sky-700 hover:underline">{r.email}</a>
                  {r.user && <> · qeydiyyatlı istifadəçi ({r.user.name || r.user.email})</>}
                </p>
              </div>

              {/* Əməliyyatlar */}
              <div className="flex shrink-0 items-start gap-2 md:flex-col md:items-stretch">
                {r.status === 'new' ? (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={!r.listing || r.listing.status === 'blocked' || busyId === r._id}
                      onClick={() => setBlockTarget(r)}
                    >
                      Elanı blokla
                    </Button>
                    <Button size="sm" disabled={busyId === r._id} onClick={() => setStatus(r, 'reviewed')}>
                      Baxıldı
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" disabled={busyId === r._id} onClick={() => setStatus(r, 'new')}>
                    Geri al
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="sm" variant="outline" aria-label="Digər əməliyyatlar" />}>
                    •••
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {r.status === 'new' && (
                      <DropdownMenuItem onClick={() => setStatus(r, 'dismissed')}>Əsassızdır</DropdownMenuItem>
                    )}
                    {r.listing && (
                      <DropdownMenuItem
                        onClick={() => window.open(`/admin/listings?q=${r.listing!._id}`, '_blank')}
                      >
                        Admin paneldə elanı aç
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(r)}>Şikayəti sil</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      <ListingPagination currentPage={page} totalPages={data?.totalPages ?? 1} />

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        title="Elan bloklansın?"
        description={
          blockTarget ? (
            <>
              <b>{titleOf(blockTarget.listing)}</b> saytdan gizlədiləcək, satıcıya bildiriş gedəcək və bu elanın bütün yeni
              şikayətləri &quot;Tədbir görülüb&quot; olacaq.
            </>
          ) : undefined
        }
        confirmLabel="Blokla"
        destructive
        withReason
        reasonPlaceholder="Satıcıya mesaj (boş qalsa standart mətn gedəcək)"
        onConfirm={blockListing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Şikayət silinsin?"
        confirmLabel="Sil"
        destructive
        onConfirm={remove}
      />
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsContent />
    </Suspense>
  )
}
