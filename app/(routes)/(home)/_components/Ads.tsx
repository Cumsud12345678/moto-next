// _components/Ads.tsx

'use client'

import { api } from '@/lib/axios'
import { useState } from 'react'

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

const Ads = ({data}: {data: Adsense[]}) => {
  const [selected, setSelected] = useState(null)

  return (
    <div className='lg:hidden block relative w-full h-28 p-3'>
      {
        data.map((ads: Adsense) => (
          <div 
            key={ads._id}
            onClick={() => {
              navigator.sendBeacon(
                `${process.env.API_URL}/api/adsense/click/${ads._id}`
              )
            }}
            className='block h-full w-full text-center'
          >
            <a href={ads.link} target='_blank'>
              <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${ads.logo}`} alt="" className='h-full w-full max-w-120 object-cover mx-auto' />
            </a>
          </div>
        ))
      }
    </div>
  )
}

export default Ads