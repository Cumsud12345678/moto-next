'use client'
import { api } from "@/lib/axios"
import { columns, Listing } from "../columns"
import { DataTable } from "../../components/data-table"
import { useEffect, useState } from "react"
import EditDialog from "../edit-dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TrashBin } from "@gravity-ui/icons"
import PlaceholderEffectInput from "@/components/inputs/PlaceholderEffectInput"
import { toast } from "@/components/ui/toast"
import { useRouter, useSearchParams } from "next/navigation"
import { UrgentDialog } from "../urgent-dialog"
import Galery from "@/app/elanlar/[slug]/_components/Galery"

async function getFilteredListings(
  params: Record<string, string>
): Promise<Listing[]> {
  const query = new URLSearchParams(params).toString()

  const res = await api.get(
    `/api/admin/listings/filter?${query}`,
    { withCredentials: true }
  )

  if (!res.data.success) {
    throw new Error('Failed to fetch users')
  }

  return res.data.data
}

export default function ListingsFilterPage() {

  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const listingId = searchParams.get("listingId")
    const phone = searchParams.get("phone")

    setSearchId(listingId || '')
    setSearchPhone(phone || '')

    const params: Record<string, string> = {}

    if (listingId) params.listingId = listingId
    if (phone) params.phone = phone

    getFilteredListings(params)
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [searchParams])

  const [deletedOpen, setDeletedOpen] = useState<boolean>(false)
  const [deleteListingData, setDeleteListingData] = useState<Listing | undefined>(undefined)
  const [deleteMessage, setDeleteMessage] = useState<string>('')

  const handleDelete = async (listing: Listing) => {
    setDeletedOpen(true)
    setDeleteListingData(listing)
  }

  async function deleteListing() {
    const res = await api.delete(
      `/api/admin/listings/${deleteListingData?._id}`, {
        data: {
          message: deleteMessage
        },
        withCredentials: true
      }
    )
    return res.data
  }

  const handleDeleteListing = async () => {
    toast.promise(
      deleteListing(),
      {
        loading: 'Elan silinir',
        success: () => {
          setData(prev => prev.filter(a => a._id !== deleteListingData?._id))
          return 'Elan silindi'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }

  const [open, setOpen] = useState<boolean>(false)
  const [editListingData, setEditListingData] = useState<Listing | undefined>(undefined)

  const handleEdit = (listing: Listing) => {
    setOpen(true)
    setEditListingData(listing)
  }

  const handleGallery = (listing: Listing) => {
    console.log('aa')
  }

  const [openUrgent, setOpenUrgent] = useState<boolean>(false)
  const [urgentListingData, setUrgentListingData] = useState<Listing | undefined>(undefined)

  const handleUrgent = (listing: Listing) => {
    setOpenUrgent(true)
    setUrgentListingData(listing)
  }

  const [searchId, setSearchId] = useState<string>('')
  const [searchPhone, setSearchPhone] = useState<string>('')

  const handleSearchSubmit = () => {

    const params = new URLSearchParams()

    if(searchId) params.set('listingId', searchId);
    if(searchPhone) params.set('phone', searchPhone);

    router.push(`/admin/listings/filter?${params.toString()}`)
  }


  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">

      <div className="bg-white p-4 rounded-lg my-4">
        <h4 className="text-xl font-semibold">Filter</h4>
        <div className="flex gap-4 items-center">
          <PlaceholderEffectInput state={searchId} setState={setSearchId} label="Listing ID" length={100} />
          <PlaceholderEffectInput state={searchPhone} setState={setSearchPhone} label="Phone" length={100} />
          <button onClick={handleSearchSubmit} className="bg-blue-500 text-white font-semibold p-2 px-8 rounded-lg">
            Axtar
          </button>
        </div>
      </div>
      

      <DataTable
        columns={columns}
        data={data}
        meta={{ onEdit: handleEdit, onDelete: handleDelete, onGallery: handleGallery, onUrgent: handleUrgent }}
      />


      <EditDialog 
        open={open} 
        setOpen={setOpen} 
        data={data} 
        setData={setData}
        listing={editListingData}
      />

      <UrgentDialog
        open={openUrgent} 
        setOpen={setOpenUrgent} 
        data={data} 
        setData={setData}
        listing={urgentListingData}
      />

     
      <AlertDialog open={deletedOpen} onOpenChange={setDeletedOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <TrashBin />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete chat?</AlertDialogTitle>
            <AlertDialogDescription>
              <div>
                <input type="text" className="p-2 bg-[#f5f5f5]" value={deleteMessage} onChange={(e) => setDeleteMessage(e.target.value)} />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteListing} variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}