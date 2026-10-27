// page.tsx — Server Component, dəyişməz qalır
import { cookies } from 'next/headers';
import { ProductCard as CardType } from '@/types/product'
import BookmarkList from './_components/BookmarkList'
import { serverApi } from '@/lib/axios-server';
import { Metadata } from 'next';
import PartList from '@/components/parts/PartList'
import type { PartCard } from '@/types/part'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

async function getProducts(): Promise<CardType[]> {
  try {
    const cookieStore = await cookies()
    const res = await serverApi.get('/api/listings/likes', {
      headers: { Cookie: cookieStore.toString() }
    });
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

// Bəyənilmiş ehtiyat hissələri
async function getParts(): Promise<PartCard[]> {
  try {
    const cookieStore = await cookies()
    const res = await serverApi.get('/api/parts/likes', {
      headers: { Cookie: cookieStore.toString() }
    });
    return res.data.data ?? [];
  } catch {
    return [];
  }
}

const BookmarkPage = async () => {
  const [data, parts] = await Promise.all([getProducts(), getParts()])

  return (
    <div className='mt-14'>
      <div className='container mx-auto max-w-250 h-1000 p-3'>
        {parts.length > 0 && <h2 className='text-xl font-medium mb-3'>Motosikletlər</h2>}
        <BookmarkList initialData={data} />

        {parts.length > 0 && (
          <div className='mt-8'>
            <h2 className='text-xl font-medium mb-3'>Ehtiyat hissələri</h2>
            <PartList data={parts} />
          </div>
        )}
      </div>
    </div>
  )
}

export default BookmarkPage