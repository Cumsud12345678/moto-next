import ProductList from '@/components/ProductList';
import Filter from '../(home)/_components/Filter';
import { Suspense } from 'react';
import { getMetadata } from '@/lib/api/metadata';
import { cookies } from 'next/headers';
// import { getFilteredListings } from '@/lib/api/listings';

type Props = {
  searchParams: Promise<{
    make?: string,
    model?: string,
    category?: string
  }>
}

export async function getFilteredListings(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  const cookieStore = await cookies()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/listings/filter?${query}`,
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
     
      <div className='container mx-auto max-w-250 h-1000 p-4'>
        <ProductList data={data} />
      </div>

    </div>
  )
}

export default MotoPage