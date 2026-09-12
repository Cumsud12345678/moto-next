import { products } from '@/constants/products';
import ProductList from '@/components/ProductList';
import Filter from './_components/Filter';
import { Suspense } from 'react'
import { api } from '@/lib/axios';
import { ProductCard } from '@/types/product';

async function getProducts(): Promise<ProductCard[]> {
  try {
    const res = await api.get('/api/listings', { withCredentials: true });
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

const HomePage = async () => {

  const data = await getProducts();

  return (
    <div>

      <div className='mt-12 bg-[#ebedf3]'>
        <Suspense fallback={<div>Yüklənir...</div>}>
          <Filter />
        </Suspense>
      </div>

      <div className='container mx-auto max-w-250 p-3 mb-20'>
        <ProductList data={data} />
      </div>

    </div>
  )
}

export default HomePage