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
        className='bg-white rounded-xl w-full relative'
      >
        <div className='overflow-hidden relative pl-3 py-4 rounded-xl'>
          <span className='font-semibold text-[15px] text-red-500'>Ehtiyyat hissələri</span>
          <img src="/hisseler2.png" alt="" className='size-50 object-contain absolute left-0 -top-17 opacity-70' />
        </div>

        <div className='absolute text-[10px] -top-3 -right-3 bg-orange-500 p-1 rounded-full whitespace-nowrap'>
          <span className='text-white font-semibold'>yeni</span>
        </div>
        
      </div>
      <Link 
        href={'/groups'}
        className='bg-white rounded-xl w-full relative'
      >
        <div className='overflow-hidden relative pl-3 py-4 rounded-xl'>
          <span className='font-semibold text-[15px] text-red-500'>Qruplar</span>
          <img src="/group.png" alt="" className='size-30 object-contain absolute -right-5 -top-7 opacity-80' />
        </div>
        
        <div className='absolute text-[10px] -top-3 -right-3 bg-orange-500 p-1 rounded-full whitespace-nowrap'>
          <span className='text-white font-semibold'>yeni</span>
        </div>
      </Link>
      
    </Fragment>
  )
}

export default HeaderTab