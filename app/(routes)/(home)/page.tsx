import { products } from '@/constants/products';
import ProductList from '@/components/ProductList';
import Filter from './_components/Filter';
import { Suspense } from 'react'

const HomePage = () => {

  const data = products

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