import { cache } from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { isAxiosError } from 'axios'
import { serverApi } from '@/lib/axios-server'
import { idFromSlug, partPath, safeDecode } from '@/lib/slug'
import PartList from '@/components/parts/PartList'
import ViewTracker from '@/app/elanlar/[slug]/_components/ViewTracker'
import PartDetailsLeft from './_components/PartDetailsLeft'
import PartDetailsRight from './_components/PartDetailsRight'
import type { PartCard, PartDescription } from '@/types/part'

const SITE_URL = process.env.SITE_URL!

interface PageProps {
  params: Promise<{ slug: string }>
}

// Yalnız elan həqiqətən yoxdursa null; şəbəkə xətasında xəta atılır (Google 404 kimi yadda saxlamasın)
const getPart = cache(async (id: string): Promise<PartDescription | null> => {
  const cookieStore = await cookies()
  try {
    const res = await serverApi.get(`/api/parts/${id}`, { headers: { Cookie: cookieStore.toString() } })
    return res.data?.data ?? null
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 400)) return null
    console.error('Hissə elanı yüklənmədi:', err)
    throw err
  }
})

async function getCards(path: string): Promise<{ data: PartCard[], total: number }> {
  try {
    const cookieStore = await cookies()
    const res = await serverApi.get(path, { headers: { Cookie: cookieStore.toString() } })
    return { data: res.data?.data ?? [], total: res.data?.total ?? 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const id = idFromSlug(slug)
  const part = id ? await getPart(id) : null

  if (!part) {
    return { title: 'Elan tapılmadı | Motoelan', robots: { index: false, follow: false } }
  }

  const fits = [part.make?.label, part.model?.label].filter(Boolean).join(' ')
  const title = `${part.title} — ${part.price} AZN | Motoelan`
  const description =
    part.description?.replace(/\s+/g, ' ').trim().slice(0, 160) ||
    `${part.title}${fits ? ` (${fits} üçün)` : ''}. ${part.partCategory?.label ?? 'Ehtiyat hissəsi'}, ${part.price} AZN.`
  const url = `${SITE_URL}${partPath(part.title, part._id)}`
  const imageUrl = part.images?.[0] ? `${process.env.IMAGE_URL}/${part.images[0]}` : undefined

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Motoelan',
      locale: 'az_AZ',
      type: 'website',
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: part.title }] }),
    },
    twitter: { card: 'summary_large_image', title, description, ...(imageUrl && { images: [imageUrl] }) },
    robots: { index: true, follow: true },
  }
}

// Google üçün strukturlaşdırılmış məlumat
function buildJsonLd(part: PartDescription, url: string) {
  const condition = part.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition'
  const images = (part.images ?? []).slice(0, 10).map((img) => `${process.env.IMAGE_URL}/${img}`)

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: part.title,
    url,
    sku: part._id,
    ...(images.length && { image: images }),
    description: part.description?.replace(/\s+/g, ' ').trim().slice(0, 500) || `${part.title}, ${part.price} AZN.`,
    category: part.partCategory?.label ? `Motosiklet ehtiyat hissələri > ${part.partCategory.label}` : 'Motosiklet ehtiyat hissələri',
    ...(part.make?.label && { brand: { '@type': 'Brand', name: part.make.label } }),
    ...(part.make?.label && {
      isAccessoryOrSparePartFor: {
        '@type': 'Product',
        name: [part.make.label, part.model?.label].filter(Boolean).join(' '),
      },
    }),
    itemCondition: condition,
    offers: {
      '@type': 'Offer',
      url,
      price: part.price,
      priceCurrency: 'AZN',
      availability: 'https://schema.org/InStock',
      itemCondition: condition,
      ...(part.region?.label && {
        availableAtOrFrom: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: part.region.label, addressCountry: 'AZ' } },
      }),
      ...(part.seller?.name && { seller: { '@type': 'Person', name: part.seller.name } }),
    },
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Ehtiyat hissələri', item: `${SITE_URL}/hisseler` },
      ...(part.partCategory?._id
        ? [{ '@type': 'ListItem', position: 3, name: part.partCategory.label, item: `${SITE_URL}/hisseler?partCategory=${part.partCategory._id}` }]
        : []),
      { '@type': 'ListItem', position: part.partCategory?._id ? 4 : 3, name: part.title, item: url },
    ],
  }

  return JSON.stringify([product, breadcrumbs]).replace(/</g, '\\u003c')
}

const PartPage = async ({ params }: PageProps) => {
  const { slug } = await params
  const id = idFromSlug(slug)
  if (!id) notFound()

  const [part, similarRaw, sellerParts] = await Promise.all([
    getPart(id),
    getCards(`/api/parts/${id}/similar`),
    getCards(`/api/parts/${id}/seller`),
  ])
  if (!part) notFound()

  // Köhnə/səhv yazılmış URL-lər düzgün ünvana 308 ilə yönləndirilir
  const correctPath = partPath(part.title, part._id)
  if (`/hisseler/${safeDecode(slug)}` !== correctPath) permanentRedirect(correctPath)

  const sellerIds = new Set(sellerParts.data.map((p) => p._id))
  const similars = similarRaw.data.filter((p) => !sellerIds.has(p._id))

  return (
    <div className='container mx-auto max-w-250 pb-24 lg:pb-0'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: buildJsonLd(part, `${SITE_URL}${correctPath}`) }} />
      <ViewTracker listingId={part._id} url={`/api/parts/${part._id}/click`} />

      <div className='flex flex-col lg:flex-row lg:p-4 lg:bg-white gap-5'>
        <PartDetailsLeft data={part} />
        <PartDetailsRight data={part} />
      </div>

      {sellerParts.data.length > 0 && (
        <div className='p-3 mt-3'>
          <h2 className='text-xl font-medium mb-3'>
            Satıcının digər hissələri <span className='text-gray-400'>({sellerParts.total})</span>
          </h2>
          <PartList data={sellerParts.data} />
        </div>
      )}

      {similars.length > 0 && (
        <div className='p-3 mt-3'>
          <h2 className='text-xl font-medium mb-3'>Oxşar hissələr</h2>
          <PartList data={similars} />
        </div>
      )}
    </div>
  )
}

export default PartPage
