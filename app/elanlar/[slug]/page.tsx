import React, { cache } from 'react'
import DetailsLeft from './_components/DetailsLeft'
import DetailsRight from './_components/DetailsRight'
import { ProductCard, ProductDescription } from '@/types/product'
import { cookies } from 'next/headers'
import ProductList from '@/components/ProductList'
import Link from 'next/link'
import { serverApi } from '@/lib/axios-server'
import type { Metadata } from "next";
import { notFound, permanentRedirect } from 'next/navigation'
import { isAxiosError } from 'axios'
import { idFromSlug, listingPath, safeDecode } from '@/lib/slug'

// cache(): generateMetadata və səhifə eyni sorğunu iki dəfə göndərməsin
//
// ƏVVƏL: backend cavab verməyəndə (Render yuxu rejimi, timeout) bu funksiya null
// qaytarırdı -> səhifə 404 + "noindex" olurdu. Googlebot elə o anda gəlsəydi,
// elanı "mövcud deyil" kimi yadda saxlayırdı.
// İNDİ: yalnız elan həqiqətən yoxdursa null qaytarırıq. Şəbəkə/server xətasında
// xəta atırıq -> Next 500 qaytarır və Google sonra yenidən yoxlayır.
const getProduct = cache(async (id: string): Promise<ProductDescription | null> => {
  const cookieStore = await cookies()

  try {
    const res = await serverApi.get(`/api/listings/${id}`, {
      headers: { Cookie: cookieStore.toString() },
    })
    // backend tapmayanda 200 + null qaytarır
    return res.data?.data ?? null
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) {
      return null
    }
    console.error('Failed to fetch product:', err)
    throw err
  }
})

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

const SITE_URL = process.env.SITE_URL!

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const id = idFromSlug(slug);

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

  const title = `${make} ${model}${product.year ? ` ${product.year}` : ""} — ${product.price} AZN | Motoelan`;

  const description =
    product.description
      ?.replace(/\s+/g, " ")
      .trim()
      .slice(0, 160) ||
    `${make} ${model} motosiklet elanı. ${product.price} AZN.`;

  const image = product.images?.[0];

  // Canonical HƏMİŞƏ elanın məlumatından qurulur, gələn URL-dən yox.
  // Əvvəl "/elanlar/<id>" və "/elanlar/Yamaha-FZ-S Fi..." kimi hər variant
  // özünü canonical elan edirdi.
  const url = `${SITE_URL}${listingPath(make, model, product._id)}`;

  const imageUrl = image
  ? `${process.env.IMAGE_URL}/${image}`   // IMAGE_URL = https://... olmalıdır
  : undefined;

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

      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
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
      ...(imageUrl && { images: [imageUrl] }), 
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

const ElanlarPage = async ({params}: PageProps) => {

  const {slug} = await params
  const id = idFromSlug(slug)

  if(!id) notFound()

  const [data, similars] = await Promise.all([
    getProduct(id),
    getSimilars(id)
  ])
  
  if (!data) notFound();

  // Köhnə URL-lər (boşluqlu, böyük hərfli, yalnız id) düzgün URL-ə 308 ilə yönləndirilir
  const correctPath = listingPath(data.make?.label, data.model?.label, data._id)
  if (`/elanlar/${safeDecode(slug)}` !== correctPath) {
    permanentRedirect(correctPath)
  }

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