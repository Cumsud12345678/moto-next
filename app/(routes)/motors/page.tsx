import ProductList from '@/components/ProductList';
import Filter from '../(home)/_components/Filter';
import { Suspense } from 'react';
import { getMetadata } from '@/lib/api/metadata';
import { cookies } from 'next/headers';
import Ads from '../(home)/_components/Ads';
import { serverApi } from '@/lib/axios-server';

type Props = {
  searchParams: Promise<{
    make?: string,
    model?: string,
    category?: string
  }>
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

export async function getFilteredListings(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  const cookieStore = await cookies()
  const res = await fetch(
    `${process.env.API_URL}/api/listings/filter?${query}`,
    {
      cache: 'no-store',
      headers: {
        Cookie: cookieStore.toString()
      }
    }
  )
 
  if (!res.ok) {
    throw new Error('Failed to fetch metadata')
  }

  const body = await res.json()
  return body.data
}

const MotoPage = async ({searchParams}: Props) => {

  const params = await searchParams

  // const data = products
  const data = await getFilteredListings(params)
  const metadata = await getMetadata()
  const adsenseData = await getAdsense()

  const adsenseMobile = adsenseData.filter(ads => ads.position === 'mobile')

  if(!data) {
    return (
      <div>

      </div>
    )
  }

  return (
    <div>

      <div className='mt-12 bg-[#ebedf3]'>
        <Suspense fallback={<div>Yüklənir...</div>}>
          <Filter initialMetadata={metadata} />
        </Suspense>
      </div>

      {
        adsenseMobile.length !== 0
        &&
        <Ads data={adsenseMobile} />
      }
     
      <div className='container mx-auto max-w-250 p-4'>
        <ProductList data={data} />
      </div>

    </div>
  )
}

export default MotoPage