import React from 'react'
import DetailsLeft from './_components/DetailsLeft'
import DetailsRight from './_components/DetailsRight'
import { api } from '@/lib/axios'
import { ProductCard, ProductDescription } from '@/types/product'
import { cookies } from 'next/headers'
import ProductList from '@/components/ProductList'

async function getProduct(id: string): Promise<ProductDescription | null> {
  try {
    const cookieStore = await cookies()

    const res = await api.get(`/api/listings/${id}`, {
      headers: {
        Cookie: cookieStore.toString()
    }});

    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return null;
  }
}

async function getSimilars(id: string): Promise<ProductCard[] | []> {
  try {
    const cookieStore = await cookies()

    const res = await api.get(`/api/listings/${id}/similar`, {
      headers: {
        Cookie: cookieStore.toString()
    }})

    return res.data.data
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return []
  }
}

const ElanlarPage = async ({params}: {params: Promise<{slug: string}>}) => {

  const {slug} = await params
  const id: string | undefined = slug.split("-").pop()
  // const product = products[Number(id) - 1]

  if(!id) return

  const [data, similars] = await Promise.all([
    getProduct(id),
    getSimilars(id)
  ])

  console.log(similars)

  if(!data) {
    return (
      <div>

      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-250 pb-40'>
      <div className='flex flex-col lg:flex-row lg:p-4 lg:bg-white gap-5'>
        <DetailsLeft data={data} />
        <DetailsRight price={data.price} name={data.seller.name} city={data.region.label} />
      </div>

      <div className='p-3'>
        <ProductList data={similars} />
      </div>

    </div>
  )
}

export default ElanlarPage