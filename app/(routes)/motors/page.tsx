import { products } from '@/constants/products';
import ProductList from '@/components/ProductList';
import Filter from '../(home)/_components/Filter';

type Props = {
  searchParams: Promise<{
    make?: string,
    model?: string,
    category?: string
  }>
}

const MotoPage = async ({searchParams}: Props) => {

  const params = await searchParams

  const make = params.make
  const model = params.model
  const category = params.category

  const data = products

  console.log('aaa')

  return (
    <div>

      <div className='mt-12 bg-[#ebedf3]'>
        <Filter />
      </div>

      <div className='container mx-auto max-w-250 h-1000 p-4'>
        <ProductList data={data} />
      </div>

    </div>
  )
}

export default MotoPage