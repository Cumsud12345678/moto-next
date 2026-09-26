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
import { toast } from "@/components/ui/toast"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"

interface EditProfileProps {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  id: string,
  name: string,
  setName: React.Dispatch<React.SetStateAction<string>>
}

async function setForm(name: string, id: string) {
  try{
    const res = await api.put(
      `/api/users/edit/name/${id}`,
      { name: name },
      { withCredentials: true }
    )

    return res.data.success
  }catch(err){
    return err
  }
}

export function EditProfile({ open, setOpen, id, name, setName }: EditProfileProps) {

  const [nameValue, setNameValue] = useState<string>(name)

  useEffect(() => {
    setNameValue(name)
  }, [name])

  const handleSetForm = async () => {
    
    toast.promise(
      setForm(nameValue, id),
      {
        loading: 'Profil guncellenir',
        success: () => {
          setName(nameValue)
          setOpen(false)
          return 'Guncellendi'
        },
        error: (error) => {
          return error
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
              <Label htmlFor="name-1">Name</Label>
              <Input 
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                id="name-1" 
                name="name" 
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button 
              onClick={handleSetForm}
              type="submit"
            >Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}