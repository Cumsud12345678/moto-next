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
import { User } from "./columns"
import { api } from "@/lib/axios"

const roles = ['user', 'seller', 'service', 'admin']

interface EditDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: User[],
  setData: React.Dispatch<React.SetStateAction<User[]>>
  user: User | undefined
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

export default function EditDialog({ open, setOpen, data, setData, user }: EditDialogProps) {

  const [roleValue, setRoleValue] = useState<string | undefined>(undefined)

  async function editRole() {
    const res = await api.put(
      `/api/admin/users/edit/role/${user?._id}`,
      { role: roleValue },
      { withCredentials: true }
    )
    return res.data
  }

  const handleRoleEdit = async () => {
    toast.promise(
      editRole(),
      {
        loading: 'Rol yenilənir',
        success: () => {
          setData(prev =>
            prev.map(a => a._id === user?._id
              ? { ...a, role: roleValue as User['role'] }
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

  useEffect(() => {
    setRoleValue(user?.role)
  }, [user?.role])


  // ---------------- Warning (uyarı) ----------------

  const [warningChecks, setWarningChecks] = useState<Record<WarningReasonId, boolean>>({
    invalid_description: false,
    wrong_params: false,
  })

  const toggleWarningCheck = (id: WarningReasonId) => {
    setWarningChecks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resetWarningChecks = () => {
    setWarningChecks({ invalid_description: false, wrong_params: false })
  }

  async function warnUser() {
    const reasons = WARNING_REASONS
      .filter(r => warningChecks[r.id])
      .map(r => r.label)

    const res = await api.put(
      `/api/admin/users/warn/${user?._id}`, // 👈 endpoint adını özün dəyişərsən
      { reasons: reasons[0] },
      { withCredentials: true }
    )
    return res.data
  }

  const handleWarningSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const hasSelection = WARNING_REASONS.some(r => warningChecks[r.id])
    if (!hasSelection) {
      toast.add({ type: "default", description: "Zəhmət olmasa ən azı bir səbəb seçin" })
      return
    }

    toast.promise(
      warnUser(),
      {
        loading: 'İstifadəçi xəbərdar edilir',
        success: (resData) => {
          setData(prev =>
            prev.map(a => a._id === user?._id
              ? { ...a, isWarning: resData?.isWarning ?? a.isWarning + 1 }
              : a
            )
          )
          resetWarningChecks()
          return 'İstifadəçi uğurla xəbərdar edildi'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }

  async function resetWarnings() {
    const res = await api.put(
      `/api/admin/users/warn/reset/${user?._id}`, // 👈 endpoint adını özün dəyişərsən
      {},
      { withCredentials: true }
    )
    return res.data
  }

  const handleResetWarnings = async () => {
    toast.promise(
      resetWarnings(),
      {
        loading: 'Xəbərdarlıqlar sıfırlanır',
        success: () => {
          setData(prev =>
            prev.map(a => a._id === user?._id
              ? { ...a, isWarning: 0 }
              : a
            )
          )
          resetWarningChecks()
          return 'Xəbərdarlıqlar sıfırlandı'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }


  // ---------------- Block (blokla) ----------------

  const [blockChecks, setBlockChecks] = useState<Record<BlockReasonId, boolean>>({
    fraud: false,
    invalid_content: false,
  })

  const toggleBlockCheck = (id: BlockReasonId) => {
    setBlockChecks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const resetBlockChecks = () => {
    setBlockChecks({ fraud: false, invalid_content: false })
  }

  async function blockUser() {
    const selected = BLOCK_REASONS.filter(r => blockChecks[r.id])

    const res = await api.put(
      `/api/admin/users/block/${user?._id}`, // 👈 endpoint adını özün dəyişərsən
      // {
      //   reasons: selected.map(r => r.id),
      //   messages: selected.map(r => r.message),
      // },
      {
        message: selected.map(r => r.message)[0],
      },
      { withCredentials: true }
    )
    return res.data
  }

  const handleBlockSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const hasSelection = BLOCK_REASONS.some(r => blockChecks[r.id])
    if (!hasSelection) {
      toast.add({ type: "default", description: "Zəhmət olmasa ən azı bir səbəb seçin" })
      return
    }

    toast.promise(
      blockUser(),
      {
        loading: 'İstifadəçi bloklanır',
        success: (resData) => {
          setData(prev =>
            prev.map(a => a._id === user?._id
              ? { ...a, isLocked: true, lockedAt: resData?.lockedAt ?? new Date().toISOString() }
              : a
            )
          )
          resetBlockChecks()
          return 'İstifadəçi uğurla bloklandı'
        },
        error: () => {
          return 'Bir xəta oldu'
        }
      }
    )
  }

  async function unblockUser() {
    const res = await api.put(
      `/api/admin/users/unblock/${user?._id}`, // 👈 endpoint adını özün dəyişərsən
      {},
      { withCredentials: true }
    )
    return res.data
  }

  const handleUnblock = async () => {
    toast.promise(
      unblockUser(),
      {
        loading: 'Blokdan çıxarılır',
        success: () => {
          setData(prev =>
            prev.map(a => a._id === user?._id
              ? { ...a, isLocked: false, lockedAt: '' }
              : a
            )
          )
          resetBlockChecks()
          return 'İstifadəçi blokdan çıxarıldı'
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

              {/* Role edit */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Role edit</h4>
                <NativeSelect value={roleValue} onChange={(e) => setRoleValue(e.target.value)} className="w-1/2">
                  {roles.map((role) => (
                    <NativeSelectOption key={role} value={role}>{role}</NativeSelectOption>
                  ))}
                </NativeSelect>
                <div className="mt-3 flex gap-3">
                  <Button onClick={handleRoleEdit} variant="destructive">
                    Kaydet
                  </Button>
                </div>
              </div>

              {/* Warning */}
              <form onSubmit={handleWarningSubmit} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Useri uyar</h4>
                <div className="space-y-2.5">
                  {WARNING_REASONS.map((reason) => (
                    <label
                      key={reason.id}
                      htmlFor={`warn-${reason.id}`}
                      className="flex items-center gap-2.5 rounded-md border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`warn-${reason.id}`}
                        checked={warningChecks[reason.id]}
                        onCheckedChange={() => toggleWarningCheck(reason.id)}
                      />
                      <span className="text-sm">{reason.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-3">
                  <Button type="submit" variant="destructive">
                    Kaydet
                  </Button>
                  <Button type="button" variant="outline" onClick={handleResetWarnings}>
                    Uyarıları sıfırla
                  </Button>
                </div>
              </form>

              {/* Block */}
              <form onSubmit={handleBlockSubmit} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Useri blokla</h4>
                <div className="space-y-2.5">
                  {BLOCK_REASONS.map((reason) => (
                    <label
                      key={reason.id}
                      htmlFor={`block-${reason.id}`}
                      className="flex items-center gap-2.5 rounded-md border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`block-${reason.id}`}
                        checked={blockChecks[reason.id]}
                        onCheckedChange={() => toggleBlockCheck(reason.id)}
                      />
                      <span className="text-sm">{reason.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-3">
                  <Button type="submit" variant="destructive">
                    Kaydet
                  </Button>
                  <Button type="button" variant="default" onClick={handleUnblock}>
                    Blokdan aç
                  </Button>
                </div>
              </form>

            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}