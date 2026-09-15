import ProductList from '@/components/ProductList';
import Filter from './_components/Filter';
import { Suspense } from 'react'
import { api } from '@/lib/axios';
import { ProductCard } from '@/types/product';
import { Metadata } from '@/types/metadata';
import { getMetadata } from '@/lib/api/metadata';
import { cookies } from 'next/headers';
// import { getListings } from '@/lib/api/listings';

async function getProducts(): Promise<ProductCard[]> {
  try {
    const cookieStore = await cookies()

    const res = await api.get('/api/listings', {
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

const HomePage = async () => {

  const metadata = await getMetadata() // eyni fetch — dedupe olunur, ayrıca sorğu getmir
  const products = await getProducts()

  return (
    <div>

      <div className='mt-12 bg-[#ebedf3]'>
        <Suspense fallback={<div>Yüklənir...</div>}>
          <Filter initialMetadata={metadata} />
        </Suspense>
      </div>

      <div className='bg-[#ebedf3] px-3 pb-3 flex flex-row gap-3'>
        <div className='bg-white pl-3 py-4 rounded-xl w-full relative overflow-hidden'>
          <span className='font-semibold text-[15px] text-red-500'>Ehtiyyat hisseleri</span>
          <img src="/hisseler2.png" alt="" className='size-50 object-contain absolute left-3 -top-17 opacity-70' />
        </div>
        <div className='bg-white pl-3 py-4 rounded-xl w-full relative overflow-hidden'>
          <span className='font-semibold text-[15px] text-red-500'>Qruplar</span>
          <img src="/group.png" alt="" className='size-30 object-contain absolute -right-6 -top-7 opacity-80' />
        </div>
      </div>

      <div className='container mx-auto max-w-250 p-3 mb-20'>
        <ProductList data={products} />
      </div>

    </div>
  )
}

export default HomePage