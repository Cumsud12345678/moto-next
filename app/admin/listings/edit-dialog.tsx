'use client'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"

import { toast } from "@/components/ui/toast"
import React, { useEffect, useState } from "react"
import { Listing } from "./columns"
import { api } from "@/lib/axios"

const statuses = ['pending', 'active', 'sold', 'expired', 'rejected', 'blocked']

interface EditDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: Listing[],
  setData: React.Dispatch<React.SetStateAction<Listing[]>>
  listing: Listing | undefined
}

// Uyarı üçün səbəblər
const WARNING_REASONS = [
  { id: "invalid_description", label: "Uyğunsuz açıqlama" },
  { id: "wrong_params", label: "Parametrlərin səhv yazılması" },
] as const

// Bloklama üçün səbəblər
const BLOCK_REASONS = [
  {
    id: "fraud",
    label: "Dolandırıcılıq",
    message: "İstifadəçi hesabında dolandırıcılıq fəaliyyəti aşkar edilib.", // 👈 özün dəyişərsən
  },
  {
    id: "invalid_content",
    label: "Uyğunsuz məzmun",
    message: "İstifadəçi platforma qaydalarına zidd məzmun paylaşıb.", // 👈 özün dəyişərsən
  },
] as const

type WarningReasonId = typeof WARNING_REASONS[number]["id"]
type BlockReasonId = typeof BLOCK_REASONS[number]["id"]

export default function EditDialog({ open, setOpen, data, setData, listing }: EditDialogProps) {

  const [status, setStatus] = useState<string | undefined>(undefined)

  useEffect(() => {
    setStatus(listing?.status)
  }, [listing?.status])

  async function editStatus() {
    const res = await api.put(
      `/api/admin/listings/edit/status/${listing?._id}`,
      { status: status },
      { withCredentials: true }
    )
    return res.data
  }

  const handleStatusEdit = async () => {
    toast.promise(
      editStatus(),
      {
        loading: 'Rol yenilənir',
        success: () => {
          setData(prev =>
            prev.map(a => a._id === listing?._id
              ? { ...a, status: status as Listing['status'] }
              : a
            )
          )
          return 'Rol uğurla dəyişdirildi'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User edit</DialogTitle>
          <DialogDescription>
            <div className="text-black overflow-auto max-h-[75vh] space-y-3 pr-1">

              {/* Status edit */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Role edit</h4>
                <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-1/2">
                  {statuses.map((status) => (
                    <NativeSelectOption key={status} value={status}>{status}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <div className="mt-3 flex gap-3">
                  <Button onClick={handleStatusEdit} variant="destructive">
                    Kaydet
                  </Button>
                </div>
              </div>

            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}