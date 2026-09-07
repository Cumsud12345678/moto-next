import { Product } from '@/types/product'
import React from 'react'
import ProductCard from './ProductCard'

const ProductList = ({data}: {data: Product[]}) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 align-items-center'>
      {
        data.map((p: Product) => (
          <ProductCard key={p._id} product={p} />
        ))
      }
    </div>
  )
}

export default ProductList