import React, { cache } from 'react'
import DetailsLeft from './_components/DetailsLeft'
import DetailsRight from './_components/DetailsRight'
import ViewTracker from './_components/ViewTracker'
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

// Eyni satıcının digər aktiv elanları
async function getSellerListings(id: string): Promise<{ data: ProductCard[], total: number }> {
  try {
    const cookieStore = await cookies()
    const res = await serverApi.get(`/api/listings/${id}/seller`, {
      headers: { Cookie: cookieStore.toString() },
    })
    return { data: res.data?.data ?? [], total: res.data?.total ?? 0 }
  } catch (err) {
    console.error('Failed to fetch seller listings:', err)
    return { data: [], total: 0 }
  }
}

// Google üçün strukturlaşdırılmış məlumat (JSON-LD): axtarışda qiymət, şəkil və s. göstərilə bilər
function buildJsonLd(product: ProductDescription, url: string) {
  const make = product.make?.label || ''
  const model = product.model?.label || ''
  const name = [make, model, product.year].filter(Boolean).join(' ')
  const images = (product.images ?? []).slice(0, 10).map((img) => `${process.env.IMAGE_URL}/${img}`)

  const motorcycle = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'Motorcycle'],
    name,
    url,
    ...(images.length && { image: images }),
    description:
      product.description?.replace(/\s+/g, ' ').trim().slice(0, 500) ||
      `${name} motosiklet elanı, ${product.price} AZN.`,
    sku: product._id,
    category: 'Motosiklet',
    ...(make && { brand: { '@type': 'Brand', name: make } }),
    ...(model && { model }),
    ...(product.year && { vehicleModelDate: String(product.year) }),
    ...(product.mileage !== undefined && {
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: product.mileage, unitCode: 'KMT' },
    }),
    ...(product.volume && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        engineDisplacement: { '@type': 'QuantitativeValue', value: product.volume, unitCode: 'CMQ' },
        ...(product.fuelType?.label && { fuelType: product.fuelType.label }),
      },
    }),
    ...(product.transmission?.label && { vehicleTransmission: product.transmission.label }),
    ...(product.color?.label && { color: product.color.label }),
    // Bazada used=true "Yeni" deməkdir
    itemCondition: product.used ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    offers: {
      '@type': 'Offer',
      url,
      price: product.price,
      priceCurrency: 'AZN',
      availability: 'https://schema.org/InStock',
      itemCondition: product.used ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      ...(product.region?.label && {
        availableAtOrFrom: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: product.region.label, addressCountry: 'AZ' } },
      }),
      ...(product.seller?.name && { seller: { '@type': 'Person', name: product.seller.name } }),
    },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Motosikletlər', item: `${SITE_URL}/motors` },
      ...(make && product.make?._id
        ? [{ '@type': 'ListItem', position: 3, name: make, item: `${SITE_URL}/motors?make=${product.make._id}` }]
        : []),
      { '@type': 'ListItem', position: make ? 4 : 3, name: name || 'Elan', item: url },
    ],
  }

  // "</script>" mətni JSON-un içindən skripti bağlamasın
  return JSON.stringify([motorcycle, breadcrumbs]).replace(/</g, '\\u003c')
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

  const [data, similarsRaw, sellerListings] = await Promise.all([
    getProduct(id),
    getSimilars(id),
    getSellerListings(id),
  ])
  
  if (!data) notFound();

  // Köhnə URL-lər (boşluqlu, böyük hərfli, yalnız id) düzgün URL-ə 308 ilə yönləndirilir
  const correctPath = listingPath(data.make?.label, data.model?.label, data._id)
  if (`/elanlar/${safeDecode(slug)}` !== correctPath) {
    permanentRedirect(correctPath)
  }

  // Satıcının elanları oxşar elanlarda təkrar görünməsin
  const sellerIds = new Set(sellerListings.data.map((l) => l._id))
  const similars = similarsRaw.filter((l) => !sellerIds.has(l._id))

  const jsonLd = buildJsonLd(data, `${SITE_URL}${correctPath}`)

  return (
    <div className='container mx-auto max-w-250 pb-0'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ViewTracker listingId={data._id} />

      <div className='flex flex-col lg:flex-row lg:p-4 lg:bg-white gap-5'>
        <DetailsLeft data={data} />
        <DetailsRight data={data} />
      </div>

      {sellerListings.data.length > 0 && (
        <div className='p-3 mt-3'>
          <h2 className='text-xl font-medium mb-3'>
            Satıcının digər elanları
            {sellerListings.total > 0 && <span className='text-gray-400'> ({sellerListings.total})</span>}
          </h2>
          <ProductList data={sellerListings.data} infinite={false} />
        </div>
      )}

      {similars.length > 0 && (
        <div className='p-3 mt-3'>
          <h2 className='text-xl font-medium mb-3'>Oxşar elanlar</h2>
          <ProductList data={similars} infinite={false} />
        </div>
      )}

    </div>
  )
}

export default ElanlarPage