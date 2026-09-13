'use client'
import { RootState } from '@/redux/store'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BellFill, PencilToSquare } from '@gravity-ui/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductCard from './_components/ProductCard'
import { ProductCard as CardType } from '@/types/product'
import { getMyListings, deleteListing } from '@/lib/api/listings'
import { toast } from '@/components/ui/toast'

const ProfilePage = () => {
  // ============ BÜTÜN HOOK-LAR BURADA, ŞƏRTSİZ ============
  const user = useSelector((state: RootState) => state.user.user)
  const authLoading = useSelector((state: RootState) => state.user.loading)

  const [data, setData] = useState<CardType[]>([])
  const [loading, setLoading] = useState(true)

  // page.tsx
  useEffect(() => {
    if (!user?._id) return

    const fetchListings = async () => {
      setLoading(true)
      try {
        const listings = await getMyListings()  // artıq id lazım deyil
        setData(listings || [])
      } catch (err) {
        console.error('Elanlar çəkilmədi:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [user?._id])

  const handleDelete = async (id: string) => {
    const prevData = data
    setData(prev => prev.filter((p) => p._id !== id))

    toast.promise(
      deleteListing(id),
      {
        loading: 'Elan silinir',
        success: 'Elan uqurla silindi',
        error: (err) => {
          setData(prevData)
          return 'Elan silinmədi, yenidən cəhd edin'
        }
      }
    )

    // try {
    //   await deleteListing(id)
    // } catch (err) {
    //   console.error('Elan silinmədi:', err)
    //   setData(prevData)
    // }
  }

  // ============ İNDİ ERKƏN RETURN ETMƏK OLAR — BÜTÜN HOOK-LAR ARTIQ ÇAĞIRILIB ============
  if (authLoading || !user) {
    return <div className="text-center mt-20">Yüklənir...</div>
  }

  const activeListings = data.filter((p) => p.status === 'active')
  const deactiveListings = data.filter((p) => p.status === 'inactive')
  const warningListings = data.filter((p) => p.status === 'rejected')

  console.log(data)

  return (
    <div className="container mx-auto max-w-250">
      <div className="mt-15 p-3">

        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
          <div className='flex gap-2'>
            <div className="relative size-12 overflow-hidden rounded-full border flex flex-row">
              <Image
                src={user.avatar && user.avatar !== 'default' ? user.avatar : '/logo.png'}
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

        <Tabs defaultValue="active" className="w-full mt-6">
          <TabsList className='bg-gray-300 w-full'>
            <TabsTrigger value="active">Aktiv</TabsTrigger>
            <TabsTrigger value="deactive">Deaktiv</TabsTrigger>
            <TabsTrigger value="warning">Imtina</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Yüklənir...</div>
            ) : activeListings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Aktiv elanınız yoxdur.</div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {activeListings.map((p) => (
                  <ProductCard key={p._id} product={p} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deactive">
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {deactiveListings.map((p) => (
                <ProductCard key={p._id} product={p} onDelete={handleDelete} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="warning">
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {warningListings.map((p) => (
                <ProductCard key={p._id} product={p} onDelete={handleDelete} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}

export default ProfilePage