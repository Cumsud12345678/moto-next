import ProductList from '@/components/ProductList';
import Filter from '../(home)/_components/Filter';
import { Suspense } from 'react';
import { getMetadata } from '@/lib/api/metadata';
import { cookies } from 'next/headers';
import Ads from '../(home)/_components/Ads';
import { serverApi } from '@/lib/axios-server';
import ListingPagination from '@/components/ListingPagination';

const LIMIT = 20

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
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

    const res = await serverApi.get('/api/adsense', {
      headers: {
        Cookie: cookieStore.toString()
      }
    });
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

async function getFilteredListings(params: Record<string, string>, page: number) {
  const query = new URLSearchParams({
    ...params,
    page: String(page),
    limit: String(LIMIT),
  }).toString()

  const cookieStore = await cookies()
  const res = await fetch(`${process.env.API_URL}/api/listings/filter?${query}`, {
    cache: 'no-store',
    headers: { Cookie: cookieStore.toString() },
  })

  if (!res.ok) throw new Error('Failed to fetch listings')

  const body = await res.json()
  return {
    data: body.data ?? [],
    totalPages: body.totalPages ?? Math.ceil((body.total ?? 0) / LIMIT),
  }
}

const MotoPage = async ({ searchParams }: Props) => {
  const raw = await searchParams

  // page-i ayır, qalanları filter kimi göndər
  const { page: pageParam, ...rest } = raw
  const filters: Record<string, string> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === 'string' && value) filters[key] = value
  }
  const currentPage = Math.max(1, Number(pageParam) || 1)

  const [{ data, totalPages }, metadata, adsenseData] = await Promise.all([
    getFilteredListings(filters, currentPage),
    getMetadata(),
    getAdsense(),
  ])

  const adsenseMobile = adsenseData.filter(ads => ads.position === 'mobile')

  return (
    <div>
      <div className='mt-12 bg-[#ebedf3]'>
        <Suspense fallback={<div>Yüklənir...</div>}>
          <Filter initialMetadata={metadata} />
        </Suspense>
      </div>

      {adsenseMobile.length !== 0 && <Ads data={adsenseMobile} />}

      <div className='container mx-auto max-w-250 p-4 mb-20'>
        <ProductList data={data} infinite={false} />
        <Suspense fallback={null}>
          <ListingPagination currentPage={currentPage} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  )
}

export default MotoPage