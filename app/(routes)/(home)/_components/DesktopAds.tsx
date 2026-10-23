/* eslint-disable @next/next/no-img-element -- reklam bannerlərinin ölçüsü dəyişkəndir */
'use client'

type DesktopAd = {
  _id: string
  logo: string
  link: string
  position: 'mobile' | 'deskop_left' | 'deskop_right'
}

// Geniş ekranlarda (≥1400px) məzmunun sol və sağında sabit reklam bannerləri.
// Admin paneldə "Kompüter — sol / sağ" seçilən reklamlar burada göstərilir.
const DesktopAds = ({ data }: { data: DesktopAd[] }) => {
  const left = data.filter((ad) => ad.position === 'deskop_left')
  const right = data.filter((ad) => ad.position === 'deskop_right')

  const click = (id: string) => {
    navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL}/api/adsense/click/${id}`)
  }

  const column = (ads: DesktopAd[], side: 'left' | 'right') =>
    ads.length > 0 && (
      <aside
        className={`hidden min-[1400px]:flex fixed top-28 ${side === 'left' ? 'left-4' : 'right-4'} z-10 w-40 flex-col gap-3`}
        aria-label="Reklam"
      >
        {ads.map((ad) => (
          <a
            key={ad._id}
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => click(ad._id)}
            className="block overflow-hidden rounded-lg"
          >
            <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${ad.logo}`} alt="Reklam" className="w-full object-cover" />
          </a>
        ))}
      </aside>
    )

  return (
    <>
      {column(left, 'left')}
      {column(right, 'right')}
    </>
  )
}

export default DesktopAds
