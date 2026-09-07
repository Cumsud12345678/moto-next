'use client'
import { RootState } from '@/redux/store'
import Image from 'next/image'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import {BellFill} from '@gravity-ui/icons';
import {PencilToSquare} from '@gravity-ui/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { products } from '@/constants/products'
import ProductList from '@/components/ProductList'
import { Product } from '@/types/product'
import ProductCard from './_components/ProductCard'

const ProfilePage = () => {

  const user = useSelector((state: RootState) => state.user)
  const [data, setData] = useState<Product[]>(products)

  // const [openAlertDelete, setOpenAlertDelete] = useState<boolean>(false)
  // const [deletedId, setDeletedId] = useState<number>(0)

  const handleDelete = (id: number) => {
    setData(prev => prev.filter((p: Product) => p._id !== id))
  }

  return (
    <div className="container mx-auto max-w-250">
      <div className="mt-15 p-3">

        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
          <div className='flex gap-2'>
            <div className="relative size-12 overflow-hidden rounded-full border flex flex-row">
              <Image
                src={user.avatar}
                alt="Profil şəkli"
                fill
                className="object-cover"
              />
            </div>
            <div className='flex flex-col'>
              <span>{user.name}</span>
              <span>{user.email}</span>
            </div>
          </div>
          
          <div className='px-2 flex gap-2'>
            <button>
              <BellFill className='size-6' />
            </button>
            <button>
              <PencilToSquare className='size-6' />
            </button>
          </div>
        </div>



        <Tabs defaultValue="account" className="w-full mt-6">
          <TabsList className='bg-gray-300 w-full'>
            <TabsTrigger value="active">Aktiv</TabsTrigger>
            <TabsTrigger value="deactive">Deaktiv</TabsTrigger>
            <TabsTrigger value="warning">Imtina</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 align-items-center'>
              {
                data.map((p: Product) => (
                  <ProductCard key={p._id} product={p} onDelete={(id:number) => handleDelete(id)} />
                ))
              }
            </div>
          </TabsContent>
          <TabsContent value="deactive">Change your password here.</TabsContent>
          <TabsContent value="warning">Change your password here.</TabsContent>
        </Tabs>

      </div>
    </div>
  )
}

export default ProfilePage