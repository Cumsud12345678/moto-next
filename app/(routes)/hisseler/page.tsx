import { Suspense } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { Plus } from '@gravity-ui/icons'
import { getMetadata } from '@/lib/api/metadata'
import { serverApi } from '@/lib/axios-server'
import ListingPagination from '@/components/ListingPagination'
import SortSelect, { PART_SORT_OPTIONS } from '@/components/SortSelect'
import PartList from '@/components/parts/PartList'
import PartFilter from './_components/PartFilter'
import DesktopAds from '../(home)/_components/DesktopAds'
import Ads from '../(home)/_components/Ads'
import type { PartCard } from '@/types/part'

const LIMIT = 20

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = Object.entries(params).some(([key, value]) => key !== 'page' && value !== undefined && value !== '')
  const hasPagination = typeof params.page === 'string' && Number(params.page) > 1

  return {
    title: 'Motosiklet ehtiyat hissələri — al və sat',
    description:
      'Azərbaycanda motosiklet ehtiyat hissələri, ekipirovka və aksesuar elanları. Mühərrik, əyləc, təkər, kask və digər hissələri tap və ya öz elanını yerləşdir.',
    alternates: { canonical: '/hisseler' },
    robots: { index: !hasFilters && !hasPagination, follow: true },
  }
}

type Adsense = {
  _id: string
  logo: string
  link: string
  position: 'mobile' | 'deskop_left' | 'deskop_right'
  isHome: boolean
  isDetails: boolean
  clickCount: number
  adsenseExpiresAt: string
  ownerName: string
  ownerPhone: string
}

async function getAdsense(): Promise<Adsense[]> {
  try {
    const cookieStore = await cookies()
    const res = await serverApi.get('/api/adsense', { headers: { Cookie: cookieStore.toString() } })
    return res.data.data ?? []
  } catch {
    return []
  }
}

async function getParts(params: Record<string, string>, page: number) {
  try {
    const cookieStore = await cookies()
    const res = await serverApi.get('/api/parts', {
      params: { ...params, page, limit: LIMIT },
      headers: { Cookie: cookieStore.toString() },
    })
    return {
      data: (res.data.data ?? []) as PartCard[],
      total: (res.data.total ?? 0) as number,
      totalPages: (res.data.totalPages ?? 1) as number,
    }
  } catch (err) {
    console.error('Hissələr yüklənmədi:', err)
    return { data: [] as PartCard[], total: 0, totalPages: 1 }
  }
}

const PartsPage = async ({ searchParams }: Props) => {
  const raw = await searchParams
  const { page: pageParam, ...rest } = raw
  const filters: Record<string, string> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === 'string' && value) filters[key] = value
  }
  const currentPage = Math.max(1, Number(pageParam) || 1)

  const [{ data, total, totalPages }, metadata, adsenseData] = await Promise.all([
    getParts(filters, currentPage),
    getMetadata(),
    getAdsense(),
  ])

  const homeAds = adsenseData.filter((ads) => ads.isHome !== false)
  const adsenseMobile = homeAds.filter((ads) => ads.position === 'mobile')

  return (
    <div>
      <div className='mt-12 bg-[#ebedf3]'>
        <Suspense fallback={<div>Yüklənir...</div>}>
          <PartFilter metadata={metadata} />
        </Suspense>
      </div>

      <DesktopAds data={homeAds} />
      {adsenseMobile.length !== 0 && <Ads data={adsenseMobile} />}

      <div className='container mx-auto max-w-250 p-3 lg:p-4 mb-20'>
        <div className='flex items-center justify-between gap-3 mb-3'>
          <h1 className='text-xl lg:text-2xl font-semibold'>Ehtiyat hissələri</h1>
          <Link
            href='/hisseler/yeni'
            className='flex items-center gap-1.5 bg-green-500 text-white rounded-lg px-3 py-2 font-medium shrink-0'
          >
            <Plus className='size-4' />
            Hissə elanı yerləşdir
          </Link>
        </div>

        <Suspense fallback={null}>
          <SortSelect total={total} options={PART_SORT_OPTIONS} />
        </Suspense>

        <PartList data={data} />

        <Suspense fallback={null}>
          <ListingPagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  )
}

export default PartsPage
