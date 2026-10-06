import React from 'react'
import DetailsLeft from './_components/DetailsLeft'
import DetailsRight from './_components/DetailsRight'
import { ProductCard, ProductDescription } from '@/types/product'
import { cookies } from 'next/headers'
import ProductList from '@/components/ProductList'
import Link from 'next/link'
import { serverApi } from '@/lib/axios-server'
import type { Metadata } from "next";
import { notFound } from 'next/navigation'

async function getProduct(id: string): Promise<ProductDescription | null> {
  try {
    const cookieStore = await cookies()

    const res = await serverApi.get(`/api/listings/${id}`, {
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

    const res = await serverApi.get(`/api/listings/${id}/similar`, {
      headers: {
        Cookie: cookieStore.toString()
    }})

    return res.data.data
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return []
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const id = slug.split("-").pop();

  if (!id) {
    return {
      title: "Elan tapılmadı | Motoelan",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Elan tapılmadı | Motoelan",
      description: "Axtardığınız motosiklet elanı tapılmadı.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const make = product.make?.label || "";
  const model = product.model?.label || "";

  const title = `${make} ${model} — ${product.price} AZN | Motoelan`;

  const description =
    product.description
      ?.replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) ||
    `${make} ${model} motosiklet elanı. ${product.price} AZN.`;

  const image = product.images?.[0];

  const url = `https://motoelan.com/elanlar/${slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: "Motoelan",
      locale: "az_AZ",
      type: "website",

      ...(image && {
        images: [
          {
            url: `${process.env.IMAGE_URL}/${image}`,
            width: 1200,
            height: 630,
            alt: `${make} ${model}`,
          },
        ],
      }),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      ...(image && {
        images: [image],
      }),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

const ElanlarPage = async ({params}: PageProps) => {

  const {slug} = await params
  const id: string | undefined = slug.split("-").pop()
  // const product = products[Number(id) - 1]

  if(!id) return

  const [data, similars] = await Promise.all([
    getProduct(id),
    getSimilars(id)
  ])

  // if(data == null) {
  //   return (
  //     <div className='w-full h-screen flex items-center justify-center flex-col'>
  //       <span>Elan tapılmadı</span>
  //       <button className='p-2 px-3 border-2 mt-3 rounded-lg bg-orange-500 text-white'>
  //         <Link href={'/'}>
  //           Ana səyfəyə qayıt
  //         </Link>
  //       </button>
  //     </div>
  //   )
  // }

  if (!data) notFound();

  return (
    <div className='container mx-auto max-w-250 pb-0'>
      <div className='flex flex-col lg:flex-row lg:p-4 lg:bg-white gap-5'>
        <DetailsLeft data={data} />
        <DetailsRight data={data} />
      </div>

      <div className='p-3 mt-3'>
        <ProductList data={similars} />
      </div>

    </div>
  )
}

export default ElanlarPage