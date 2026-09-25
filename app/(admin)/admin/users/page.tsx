'use client'
import { api } from "@/lib/axios"
import { columns, User } from "./columns"
import { DataTable } from "../components/data-table"
import { useEffect, useState } from "react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TrashBin } from "@gravity-ui/icons"
import PlaceholderEffectInput from "@/components/inputs/PlaceholderEffectInput"
import { toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

export default function UsersPage() {

  const router = useRouter()

  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get('/api/admin/users', { withCredentials: true })
        setData(res.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [])


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
          setData(prev => prev.filter(a => a._id !== deleteUserData?._id))
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
      

      <DataTable
        columns={columns}
        data={data}
        meta={{ onEdit: handleEdit, onDelete: handleDelete }}
      />


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