'use client'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { api } from "@/lib/axios"
import { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle, XCircle, OctagonAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  _id: string
  user: string
  messageType: 'success' | 'warning' | 'danger' | 'error'
  isView: boolean
  message: string
}

interface MessageProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setData: React.Dispatch<React.SetStateAction<number>>
}

// Hər tip üçün ikon, başlıq və rənglər
const typeConfig: Record<
  Message['messageType'],
  {
    icon: React.ElementType
    title: string
    className: string
    iconClassName: string
  }
> = {
  success: {
    icon: CheckCircle2,
    title: 'Uğurlu',
    className: 'border-green-500/50 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 [&>svg]:text-green-600',
    iconClassName: 'text-green-600',
  },
  warning: {
    icon: AlertTriangle,
    title: 'Xəbərdarlıq',
    className: 'border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 [&>svg]:text-yellow-600',
    iconClassName: 'text-yellow-600',
  },
  danger: {
    icon: OctagonAlert,
    title: 'Təhlükə',
    className: 'border-red-600/50 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300 [&>svg]:text-red-700',
    iconClassName: 'text-red-700',
  },
  error: {
    icon: XCircle,
    title: 'Xəta',
    className: 'border-red-500/50 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 [&>svg]:text-red-600',
    iconClassName: 'text-red-600',
  },
}

export function MessageDialog({ open, setOpen, setData }: MessageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  async function getData() {
    setLoading(true)
    try {
      const res = await api.get('/api/messages', { withCredentials: true })
      setMessages(res.data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      getData()
      setData(0)
    }
  }, [open])

  useEffect(() => {
    const setData = async () => {
      await api.put(
        `/api/messages/not/view`,
        { ids: messages.filter(message => message._id) },
        { withCredentials: true }
      )
    }

    setData()
  }, [messages])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger>
        <Button variant="outline">Sistem mesajları</Button>
      </DialogTrigger> */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sistem mesajları</DialogTitle>
          <DialogDescription>
            Sistemdəki bütün bildirişlər aşağıda göstərilib.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[50vh] space-y-3 overflow-y-auto px-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Yüklənir...</p>
          )}

          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Heç bir mesaj yoxdur.</p>
          )}

          {!loading &&
            messages.map((msg) => {
              const config = typeConfig[msg.messageType]
              const Icon = config.icon

              return (
                <Alert key={msg._id} className={cn(config.className)}>
                  <Icon className={cn("h-4 w-4", config.iconClassName)} />
                  <AlertTitle>{config.title}</AlertTitle>
                  <AlertDescription className="text-current opacity-90">
                    {msg.message}
                  </AlertDescription>
                </Alert>
              )
            })}
        </div>

        {/* <DialogFooter>
          <DialogClose variant="outline">Close</DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}