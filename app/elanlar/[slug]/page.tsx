import { products } from '@/constants/products'
import React from 'react'
import DetailsLeft from './_components/DetailsLeft'
import DetailsRight from './_components/DetailsRight'

const ElanlarPage = async ({params}: {params: Promise<{slug: string}>}) => {

  const {slug} = await params
  const id = slug.split("-").pop()
  const product = products[Number(id) - 1]

  return (
    <div className='container mx-auto max-w-250'>
      <div className='flex flex-col lg:flex-row h-500 lg:p-4 lg:bg-white gap-5'>

        <DetailsLeft data={product} />

        <DetailsRight price={product.price} name={product.user[0].name} city={product.city} />

      </div>
    </div>
  )
}

export default ElanlarPage