'use client'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

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
          `api/groups`,
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
    <div className='container mx-auto max-w-250 my-30'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>

        {
          data.map((group: Group) => (
            <div key={group.link} className='flex flex-row items-center justify-between'>
              <div className='flex flex-row items-center gap-2'>
                <div>
                  <Image src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${group.logo}`} alt="" width={30} height={30} />
                </div>
                <h4>{group.title}</h4>
              </div>
              <div>
                bax
              </div>
            </div>
          ))
        }
        

      </div>
    </div>
  )
}

export default GropusPage