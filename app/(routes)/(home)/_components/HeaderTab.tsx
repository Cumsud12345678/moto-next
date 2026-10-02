'use client'
import { toast } from '@/components/ui/toast'
import Link from 'next/link'
import { Fragment, useState } from 'react'

const HeaderTab = () => {
  


  return (
    <Fragment>
      <div 
        onClick={() => {
          toast.add({type: "warning", description: 'Çox yaxında...'})
        }}
        className='bg-white pl-3 py-4 rounded-xl w-full relative overflow-hidden'
      >
        <span className='font-semibold text-[15px] text-red-500'>Ehtiyyat hissələri</span>
        <img src="/hisseler2.png" alt="" className='size-50 object-contain absolute left-3 -top-17 opacity-70' />
      </div>
      <Link 
        href={'/groups'}
        className='bg-white pl-3 py-4 rounded-xl w-full relative overflow-hidden'
      >
        <span className='font-semibold text-[15px] text-red-500'>Qruplar</span>
        <img src="/group.png" alt="" className='size-30 object-contain absolute -right-6 -top-7 opacity-80' />
      </Link>
    </Fragment>
  )
}

export default HeaderTab