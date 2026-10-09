'use client'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import {ChevronRight} from '@gravity-ui/icons';

interface Group {
  logo: string,
  title: string,
  link: string
}

const GropusPage = () => {

  const [data, setData] = useState<Group[] | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const getData = async () => {
      try{
        const res = await api.get(
          `/api/groups`,
          { withCredentials: true }
        )

        setData(res.data.data || [])
      }catch(error) {
        toast.add({
          type: 'danger',
          description: `xeta oldu: ${error}`
        })
      }finally {
        setLoading(false)
      }
    }

    getData()
  }, [])

  if(!data) return 'loading';

  return (
    <div className='container mx-auto max-w-250 my-14 p-3'>
      <h3 className='text-xl'>WhatsApp Qrupları</h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2'>

        {
          data.length === 0
          ?
          <div>
            Məlumat tapılmadı
          </div>
          :
          data.map((group: Group) => (
            <a 
              href={group.link}
              target='_blank'
              key={group.link} 
              className='flex flex-row items-center justify-between border p-2 px-3 bg-white rounded-lg'
            >
              <div className='flex flex-row items-center gap-2'>
                <div>
                  <Avatar size='lg'>
                    <AvatarImage src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${group.logo}`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
                <h4>{group.title}</h4>
              </div>
              <div>
                <ChevronRight />
              </div>
            </a>
          ))
        }
        

      </div>
    </div>
  )
}

export default GropusPage