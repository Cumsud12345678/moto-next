'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from './components/PageHeader'
import { ListingStatusBadge } from './components/StatusBadge'
import { formatNumber } from './_lib/utils'

interface DailyPoint {
  date: string
  count: number
}

interface Stats {
  users: { total: number; lastWeek: number; blocked: number }
  listings: {
    total: number
    byStatus: Record<string, number>
    lastDay: number
    lastWeek: number
    premium: number
    views: number
  }
  makeRequestsPending: number
  errorsOpen: number
  daily: { listings: DailyPoint[]; users: DailyPoint[] }
}

async function fetchStats(): Promise<Stats> {
  const { data } = await api.get('/api/admin/stats')
  return data.data
}

function StatCard({ label, value, hint, href }: { label: string; value: number; hint?: string; href?: string }) {
  const body = (
    <div className="h-full rounded-xl border bg-white p-4 transition-colors hover:border-gray-300">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{formatNumber(value)}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
  return href ? <Link href={href}>{body}</Link> : body
}

// Kitabxanasız sadə sütun qrafiki (son 30 gün)
function DailyBars({ title, points, color }: { title: string; points: DailyPoint[]; color: string }) {
  const max = Math.max(1, ...points.map((p) => p.count))
  const total = points.reduce((s, p) => s + p.count, 0)

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">30 gündə: {formatNumber(total)}</span>
      </div>
      <div className="flex h-40 items-end gap-0.5" role="img" aria-label={`${title}, son 30 gün`}>
        {points.map((p) => (
          <div key={p.date} className="group relative flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t ${color} opacity-80 group-hover:opacity-100`}
              style={{ height: `${Math.max((p.count / max) * 100, p.count ? 4 : 1)}%` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-xs text-white group-hover:block">
              {p.date.slice(5)}: {p.count}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points.at(-1)?.date.slice(5)}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    refetchInterval: 60_000,
  })

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        description="Saytın ümumi vəziyyəti. Hər dəqiqə avtomatik yenilənir."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Yenilənir...' : 'Yenilə'}
          </Button>
        }
      />

      {isError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          Statistika yüklənmədi.
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Diqqət tələb edənlər */}
          {(data.makeRequestsPending > 0 || data.errorsOpen > 0 || (data.listings.byStatus.pending ?? 0) > 0) && (
            <div className="flex flex-wrap gap-3">
              {(data.listings.byStatus.pending ?? 0) > 0 && (
                <Link
                  href="/admin/listings"
                  className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900 hover:bg-yellow-100"
                >
                  {data.listings.byStatus.pending} elan yoxlama gözləyir →
                </Link>
              )}
              {data.makeRequestsPending > 0 && (
                <Link
                  href="/admin/make-requests"
                  className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-900 hover:bg-sky-100"
                >
                  {data.makeRequestsPending} marka sorğusu gözləyir →
                </Link>
              )}
              {data.errorsOpen > 0 && (
                <Link
                  href="/admin/error-logs"
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 hover:bg-red-100"
                >
                  {data.errorsOpen} açıq server xətası →
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Aktiv elanlar" value={data.listings.byStatus.active ?? 0} hint={`Cəmi: ${formatNumber(data.listings.total)}`} href="/admin/listings" />
            <StatCard label="Son 24 saatda elan" value={data.listings.lastDay} hint={`Son 7 gündə: ${formatNumber(data.listings.lastWeek)}`} />
            <StatCard label="Premium elanlar" value={data.listings.premium} href="/admin/premium/listings" />
            <StatCard label="Ümumi baxış" value={data.listings.views} />
            <StatCard label="İstifadəçilər" value={data.users.total} hint={`Son 7 gündə: +${formatNumber(data.users.lastWeek)}`} href="/admin/users" />
            <StatCard label="Bloklanmış istifadəçilər" value={data.users.blocked} />
            <StatCard label="Marka sorğuları" value={data.makeRequestsPending} hint="Gözləyən" href="/admin/make-requests" />
            <StatCard label="Açıq xətalar" value={data.errorsOpen} href="/admin/error-logs" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DailyBars title="Yeni elanlar" points={data.daily.listings} color="bg-orange-500" />
            <DailyBars title="Yeni istifadəçilər" points={data.daily.users} color="bg-sky-500" />
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-3 font-semibold">Elanlar statusa görə</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.listings.byStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <ListingStatusBadge status={status} />
                    <span className="font-semibold tabular-nums">{formatNumber(count)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
