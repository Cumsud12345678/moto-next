import ProductList from '@/components/ProductList';
import Filter from './_components/Filter';
import { Suspense } from 'react'
import { ProductCard } from '@/types/product';
import { getMetadata } from '@/lib/api/metadata';
import { cookies } from 'next/headers';
import Ads from './_components/Ads';
import DesktopAds from './_components/DesktopAds';
import { serverApi } from '@/lib/axios-server';
import HeaderTab from './_components/HeaderTab';
// import { getListings } from '@/lib/api/listings';
import type { Metadata } from "next";
import Script from 'next/script';

export const metadata: Metadata = {
  title: "Motosiklet Elanları — Azərbaycanda Motosiklet Al və Sat",
  description:
    "Azərbaycanda motosiklet elanları. Motosiklet al, sat və yeni elanları kəşf et. Motoelan-da motosiklet elanlarına bax.",
  alternates: {
    canonical: "/",
  },
};

type Adsense = {
  _id: string
  logo: string
  link: string
  position: 'mobile' | 'deskop_left' | 'deskop_right'
  isHome: boolean
  isDetails: boolean
  clickCount: number
  adsenseExpiresAt: string
  ownerName: string
  ownerPhone: string
}


async function getProducts(): Promise<ProductCard[]> {
  try {
    const cookieStore = await cookies()

    const res = await serverApi.get('/api/listings', {
      headers: {
        Cookie: cookieStore.toString()
      }
    });
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

async function getAdsense(): Promise<Adsense[]> {
  try {
    const cookieStore = await cookies()

    const res = await serverApi.get('/api/adsense', {
      headers: {
        Cookie: cookieStore.toString()
      }
    });
    return res.data.data;
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

const HomePage = async () => {

  const metadata = await getMetadata() // eyni fetch — dedupe olunur, ayrıca sorğu getmir
  const products = await getProducts()
  const adsenseData = await getAdsense()

  // "Ana səhifədə" işarəsi olmayan reklamlar ana səhifədə göstərilmir (köhnə reklamlarda bu sahə yoxdursa, göstərilir)
  const homeAds = adsenseData.filter(ads => ads.isHome !== false)
  const adsenseMobile = homeAds.filter(ads => ads.position === 'mobile')

  return (
    <div>

      <div className='mt-12 bg-[#ebedf3]'>
        <Suspense fallback={<div>Yüklənir...</div>}>
          <Filter initialMetadata={metadata} />
        </Suspense>
      </div>

      <DesktopAds data={homeAds} />

      <div className='bg-[#ebedf3] px-3 pb-3 flex flex-row gap-3 lg:hidden relative'>
        <HeaderTab />
      </div>

      {
        adsenseMobile.length !== 0
        &&
        <Ads data={adsenseMobile} />
      }
      

      <div className='container mx-auto max-w-250 p-3'>
        <ProductList data={products} />
      </div>

      <script src="http://localhost:4000/widget.js" data-key="wk_f5957386b26e0650a77f654487eb0988" defer></script>

    </div>
  )
}

export default HomePage