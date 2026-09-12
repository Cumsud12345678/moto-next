import React from 'react'
import ProductCard from './ProductCard'
import { ProductCard as CardType } from '@/types/product'

const ProductList = ({data}: {data: CardType[]}) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 align-items-center'>
      {
        data.map((p: CardType) => (
          <ProductCard key={p._id} product={p} />
        ))
      }
    </div>
  )
}

export default ProductList