import ProductList from '@/components/ProductList'
import { products } from '@/constants/products'
import React from 'react'

const BookmarkPage = () => {

  const data = products

  return (
    <div className='mt-12'>
      <div className='container mx-auto max-w-250 h-1000'>
        <ProductList data={data} />
      </div>
    </div>
  )
}

export default BookmarkPage