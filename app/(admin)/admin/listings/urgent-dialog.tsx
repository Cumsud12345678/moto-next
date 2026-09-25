'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Listing } from "./columns"
import { useState } from "react"
import { api } from "@/lib/axios"
import { toast } from "@/components/ui/toast"

interface UrgentDialogProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  data: Listing[],
  setData: React.Dispatch<React.SetStateAction<Listing[]>>
  listing: Listing | undefined
}

export function UrgentDialog({ open, setOpen, data, setData, listing }: UrgentDialogProps) {

  const [day, setDay] = useState<number>(0)

  async function setUrgent() {
    const res = await api.put(
      `/api/admin/listings/urgent/${listing?._id}`,
      { day: day },
      { withCredentials: true }
    )
    return res.data
  }

  const handleSetUrgent = async () => {
    toast.promise(
      setUrgent(),
      {
        loading: 'Rol yenilənir',
        success: () => {
          setData(prev =>
            prev.map(a => a._id === listing?._id
              ? { ...a, isUrgent: true }
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
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="name-1">Gun</Label>
              <Input id="name-1" name="name" value={day} onChange={(e) => setDay(Number(e.target.value))} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" onClick={handleSetUrgent}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
