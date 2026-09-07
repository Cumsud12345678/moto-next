import { products } from '@/constants/products';
import ProductList from '@/components/ProductList';
import Filter from './_components/Filter';

const HomePage = () => {

  const data = products

  return (
    <div>

      <div className='mt-12 bg-[#ebedf3]'>
        <Filter />
      </div>

      <div className='container mx-auto max-w-250 p-4 mb-10'>
        <ProductList data={data} />
      </div>

    </div>
  )
}

export default HomePage