'use client'
import { api } from "@/lib/axios"
import { columns, User } from "../columns"
import { DataTable } from "../../components/data-table"
import { useEffect, useState } from "react"
import EditDialog from "../edit-dialog"
import { Button } from "@/components/ui/button"
import { TrashBin } from "@gravity-ui/icons"
import PlaceholderEffectInput from "@/components/inputs/PlaceholderEffectInput"
import { useRouter, useSearchParams } from "next/navigation"

async function getFilteredListings(
  params: Record<string, string>
): Promise<User[]> {
  const query = new URLSearchParams(params).toString()

  const res = await api.get(
    `/api/admin/users/filter?${query}`,
    { withCredentials: true }
  )

  if (!res.data.success) {
    throw new Error('Failed to fetch users')
  }

  return res.data.data
}

export default function FilteredUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [deletedOpen, setDeletedOpen] = useState(false)

  const [open, setOpen] = useState(false)
  const [editUserData, setEditUserData] = useState<User | undefined>()

  const [searchId, setSearchId] = useState<string>('')
  const [searchEmail, setSearchEmail] = useState<string>('')

  useEffect(() => {
    const userId = searchParams.get("userId")
    const email = searchParams.get("email")

    setSearchId(userId || '')
    setSearchEmail(email || '')

    const params: Record<string, string> = {}

    if (userId) params.userId = userId
    if (email) params.email = email

    getFilteredListings(params)
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [searchParams])

  const handleDelete = async (user: User) => {
    setDeletedOpen(true)
  }

  const handleEdit = (user: User) => {
    setOpen(true)
    setEditUserData(user)
  }

  const handleSearchSubmit = () => {
    const params = new URLSearchParams()

    if (searchId) {
      params.set('userId', searchId)
    }

    if (searchEmail) {
      params.set('email', searchEmail)
    }

    const query = params.toString()

    router.push(
      query
        ? `/admin/users?${query}`
        : `/admin/users`
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">

      <div className="bg-white p-4 rounded-lg my-4">
        <h4 className="text-xl font-semibold">
          Filter
        </h4>

        <div className="flex gap-4 items-center">

          <PlaceholderEffectInput
            state={searchId}
            setState={setSearchId}
            label="User ID"
            length={100}
          />

          <PlaceholderEffectInput
            state={searchEmail}
            setState={setSearchEmail}
            label="User email"
            length={100}
          />

          <button
            onClick={handleSearchSubmit}
            className="bg-blue-500 text-white font-semibold p-2 px-8 rounded-lg"
          >
            Axtar
          </button>

        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete
        }}
      />

      <EditDialog
        open={open}
        setOpen={setOpen}
        data={data}
        setData={setData}
        user={editUserData}
      />

      {/* AlertDialog burada qala bilər */}

    </div>
  )
}