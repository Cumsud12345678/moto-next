'use client'
import { RootState } from '@/redux/store'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BellFill, PencilToSquare } from '@gravity-ui/icons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard as CardType } from '@/types/product'
import { getMyListings, deleteListing, expiredListingUpdate } from '@/lib/api/listings'
import { toast } from '@/components/ui/toast'
import { EditProfile } from './_components/EditProfile'
import { MessageDialog } from './_components/Messages'
import { getNotViewCount } from '@/lib/api/messages'
import ActiveProductCard from './_components/ActiveProductCard'
import DeactiveProductCard from './_components/DeactiveProductCard'
import RejectedProductCard from './_components/RejectedProductCard'
import { api } from '@/lib/axios'
import { decGiftCount } from '@/redux/slices/userSlice'


async function urgentListing(userId: string, listingId: string) {
  const res = await api.get(`/api/users/${userId}/urgent/listing/${listingId}`)
  return res.data
}

const ProfilePage = () => {
  // ============ BÜTÜN HOOK-LAR BURADA, ŞƏRTSİZ ============
  const user = useSelector((state: RootState) => state.user.user)
  const authLoading = useSelector((state: RootState) => state.user.loading)
  const dispatch = useDispatch()

  const [data, setData] = useState<CardType[]>([])
  const [totalNotViewMsg, setTotalNotViewMsg] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // page.tsx
  useEffect(() => {
    if (!user?._id) return

    const fetchListings = async () => {
      setLoading(true)
      try {
        const listings = await getMyListings()  // artıq id lazım deyil
        const notViewCount = await getNotViewCount()
        setData(listings || [])
        setTotalNotViewMsg(notViewCount || 0)
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
        success: (data) => {
          return data.message
        },
        error: (err) => {
          setData(prevData)
          return 'Elan silinmədi, yenidən cəhd edin'
        }
      }
    )
  }

  const handleExpiredListingUpdate = async (id: string) => {
    const prevData = data
    setData(prev =>
      prev.map(p =>
        p._id === id
          ? { ...p, status: 'active' }
          : p
      )
    );

    toast.promise(
      expiredListingUpdate(id),
      {
        loading: 'Elan aktivləşdirilir',
        success: (data) => {
          return data.message
        },
        error: (err) => {
          setData(prevData)
          return 'Elan aktivləşdirilmədi, yenidən cəhd edin'
        }
      }
    )
  }

  const [name, setName] = useState<string>('')
  const [giftCount, setGiftCount] = useState<number>(0)
  const [editOpen, setEditOpen] = useState<boolean>(false)

  useEffect(() => {
    if(!user) return;
    setName(user.name)
    setGiftCount(user.giftPremiumCount)
  }, [user])

  const handleConfirmUrgent = async (listingId: string) => {
    if(!user) return;

    const prevData = data
    setData(prev =>
      prev.map(p =>
        p._id === listingId
          ? { ...p, isUrgent: true }
          : p
      )
    );

    toast.promise(
      urgentListing(user._id, listingId),
      {
        loading: 'Elan premium edilir...',
        success: (data) => {
          // setGiftCount(giftCount - 1)
          dispatch(decGiftCount())
          return data.message
        },
        error: (err) => {
          setData(prevData)
          return 'Elan aktivləşdirilmədi, yenidən cəhd edin'
        }
      }
    )
  }

  


  const [messageOpen, setMessageOpen] = useState<boolean>(false)

  // ============ İNDİ ERKƏN RETURN ETMƏK OLAR — BÜTÜN HOOK-LAR ARTIQ ÇAĞIRILIB ============
  if (authLoading || !user) {
    return <div className="text-center mt-20">Yüklənir...</div>
  }

  const activeListings = data.filter((p) => p.status === 'active')
  const deactiveListings = data.filter((p) => p.status === 'expired')
  const rejectedListings = data.filter((p) => p.status === 'rejected')

  return (
    <div className="container mx-auto max-w-250">
      <div className="mt-15 p-3">

        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
          <div className="flex gap-2 w-[75%]">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border">
              <Image
                src={user.avatar && user.avatar !== 'default' ? user.avatar : '/profile.png'}
                alt="Profil şəkli"
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span>{name}</span>
              <span className="truncate">{user.email}</span>
            </div>
          </div>

          <div className='px-2 flex gap-2'>
            <button onClick={() => setMessageOpen(true)} className='relative'>
              {
                totalNotViewMsg !== 0
                &&
                <span className='absolute -top-2 -right-1 text-sm text-red-500 font-bold'>{totalNotViewMsg}</span>
              }
              <BellFill className='size-6 text-red-500' />
            </button>
            <button onClick={() => setEditOpen(true)}>
              <PencilToSquare className='size-6 text-green-500' />
            </button>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full mt-6">
          <TabsList className='bg-gray-300 w-full'>
            <TabsTrigger value="active">Aktiv</TabsTrigger>
            <TabsTrigger value="deactive">Deaktiv</TabsTrigger>
            <TabsTrigger value="rejected">İmtina</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Yüklənir...</div>
            ) : activeListings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Aktiv elanınız yoxdur.</div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {activeListings.map((p) => (
                  <ActiveProductCard 
                    key={p._id} 
                    product={p} 
                    giftCount={giftCount}
                    setGiftCount={setGiftCount}
                    onDelete={handleDelete} 
                    onUrgent={handleConfirmUrgent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deactive">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Yüklənir...</div>
            ) : deactiveListings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Deaktiv elanınız yoxdur.</div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {deactiveListings.map((p) => (
                  <DeactiveProductCard key={p._id} product={p} onDelete={handleDelete} onExpiredListingUpdate={handleExpiredListingUpdate} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Yüklənir...</div>
            ) : rejectedListings.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Deaktiv elanınız yoxdur.</div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {rejectedListings.map((p) => (
                  <RejectedProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>


        <EditProfile 
          open={editOpen}
          setOpen={setEditOpen}
          id={user._id}
          name={name}
          setName={setName}
        />

        <MessageDialog
          open={messageOpen}
          setOpen={setMessageOpen} 
          setData={setTotalNotViewMsg}
        />

      </div>
    </div>
  )
}

export default ProfilePage