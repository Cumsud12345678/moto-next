// page.tsx — Server Component, dəyişməz qalır
import { cookies } from 'next/headers';
import { ProductCard as CardType } from '@/types/product'
import BookmarkList from './_components/BookmarkList'
import { serverApi } from '@/lib/axios-server';

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

const BookmarkPage = async () => {
  const data = await getProducts()

  return (
    <div className='mt-14'>
      <div className='container mx-auto max-w-250 h-1000 p-3'>
        <BookmarkList initialData={data} />
      </div>
    </div>
  )
}

export default BookmarkPage