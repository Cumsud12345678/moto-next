import React from 'react'
import DetailsLeft from './_components/DetailsLeft'
import DetailsRight from './_components/DetailsRight'
import { api } from '@/lib/axios'
import { ProductDescription } from '@/types/product'



async function getProduct(id: string): Promise<ProductDescription | null> {
  try {
    const res = await api.get(`/api/listings/${id}`, { withCredentials: true });
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return null;
  }
}

const ElanlarPage = async ({params}: {params: Promise<{slug: string}>}) => {

  const {slug} = await params
  const id: string | undefined = slug.split("-").pop()
  // const product = products[Number(id) - 1]

  if(!id) return
  const data = await getProduct(id)

  if(!data) {
    return (
      <div>

      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-250'>
      <div className='flex flex-col lg:flex-row h-500 lg:p-4 lg:bg-white gap-5'>

        <DetailsLeft data={data} />

        <DetailsRight price={data.price} name={data.seller.name} city={data.region.label} />

      </div>
    </div>
  )
}

export default ElanlarPage