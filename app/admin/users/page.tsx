'use client'
import { api } from "@/lib/axios"
import { columns, User } from "./columns"
import { DataTable } from "../components/data-table"
import { Suspense, useCallback, useEffect, useState } from "react"
import EditDialog from "./edit-dialog"

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
} from "@/components/ui/alert-dialog"
import { TrashBin } from "@gravity-ui/icons"
import PlaceholderEffectInput from "@/components/inputs/PlaceholderEffectInput"
import { toast } from "@/components/ui/toast"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
// Yolu öz layihənizə uyğun dəyişin (ListingPagination.tsx harada saxlayırsınızsa)
import ListingPagination from "@/components/ListingPagination"

const PAGE_SIZE = 10

function UsersContent() {

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL-dəki ?page=2 dəyəri
  const currentPage = Math.max(parseInt(searchParams.get('page') ?? '1', 10) || 1, 1)

  const [data, setData] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true) // yalnız ilk yüklənmədə true olur

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  const getData = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/users', {
        params: { page: currentPage, limit: PAGE_SIZE },
        withCredentials: true
      })
      setData(res.data.data)
      setTotal(res.data.total)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    getData()
  }, [getData])

  // Səhifə say azalıbsa (məs. son istifadəçi silinib), son səhifəyə qayıt
  useEffect(() => {
    if (loading || total === 0 || currentPage <= totalPages) return

    const params = new URLSearchParams(searchParams.toString())
    if (totalPages <= 1) params.delete('page')
    else params.set('page', String(totalPages))
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [loading, total, currentPage, totalPages, searchParams, pathname, router])


  const [deletedOpen, setDeletedOpen] = useState<boolean>(false)
  const [deleteUserData, setDeleteUserData] = useState<User | undefined>(undefined)
  const [deleteMessage, setDeleteMessage] = useState<string>('')

  const handleDelete = async (user: User) => {
    setDeletedOpen(true)
    setDeleteUserData(user)
  }

  async function deleteUser() {
    const res = await api.delete(
      `/api/admin/users/${deleteUserData?._id}`, {
      data: {
        reason: deleteMessage
      },
      withCredentials: true
    }
    )
    return res.data
  }

  const handleDeleteUser = async () => {
    toast.promise(
      deleteUser(),
      {
        loading: 'User silinir',
        success: () => {
          // Lokal filter əvəzinə serverdən yenidən çəkirik ki,
          // səhifə dolu qalsın və total düzgün olsun
          getData()
          return 'User silindi'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }


  const [open, setOpen] = useState<boolean>(false)
  const [editUserData, setEditUserData] = useState<User | undefined>(undefined)

  const handleEdit = (user: User) => {
    // Modal açın və ya edit səhifəsinə yönləndirin
    setOpen(true)
    setEditUserData(user)
  }


  const [searchId, setSearchId] = useState<string>('')
  const [searchEmail, setSearchEmail] = useState<string>('')


  const handleSearchSubmit = () => {

    const params = new URLSearchParams()

    if(searchId) params.set('userId', searchId);
    if(searchEmail) params.set('email', searchEmail);

    router.push(`/admin/users/filter?${params.toString()}`)
  }


  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">

      <div className="bg-white p-4 rounded-lg my-4">
        <h4 className="text-xl font-semibold">Filter</h4>
        <div className="flex gap-4 items-center">
          <PlaceholderEffectInput state={searchId} setState={setSearchId} label="User ID" length={100} />
          <PlaceholderEffectInput state={searchEmail} setState={setSearchEmail} label="User email" length={100} />
          <button onClick={handleSearchSubmit} className="bg-blue-500 text-white font-semibold p-2 px-8 rounded-lg">
            Axtar
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-2">Cəmi: {total}</p>

      <DataTable
        columns={columns}
        data={data}
        meta={{ onEdit: handleEdit, onDelete: handleDelete }}
      />

      <ListingPagination currentPage={currentPage} totalPages={totalPages} />

      <EditDialog
        open={open}
        setOpen={setOpen}
        data={data}
        setData={setData}
        user={editUserData}
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
            <AlertDialogAction onClick={handleDeleteUser} variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// useSearchParams istifadə edən komponent Suspense daxilində olmalıdır (build xətası olmasın deyə)
export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersContent />
    </Suspense>
  )
}