'use client'
import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { api } from '@/lib/axios'
import { RootState } from '@/redux/store'

interface MakeRequestDialogProps {
  // Seçilmiş marka varsa inputa əvvəlcədən yazılır (məs. "Yamaha ")
  initialText?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function MakeRequestDialog({ initialText = '' }: MakeRequestDialogProps) {
  const user = useSelector((state: RootState) => state.user.user)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)

  const openDialog = () => {
    setText(initialText ? `${initialText} ` : '')
    setEmail(user?.email ?? '')
    setOpen(true)
  }

  const handleSend = async () => {
    if (sendingRef.current) return

    const cleanText = text.replace(/\s+/g, ' ').trim()
    const cleanEmail = email.trim().toLowerCase()

    if (cleanText.length < 2) {
      return toast.add({ type: 'warning', description: 'Marka və ya model yazın' })
    }
    if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
      return toast.add({ type: 'warning', description: 'Email düzgün deyil' })
    }

    sendingRef.current = true
    setSending(true)
    try {
      const { data } = await api.post('/api/make-requests', {
        text: cleanText,
        email: cleanEmail || undefined,
      })
      toast.add({ type: 'success', description: data.message })
      setOpen(false)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.add({ type: 'error', description: message || 'Sorğu göndərilmədi', priority: 'high' })
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="mt-3 w-full rounded-xl border border-dashed border-sky-400 bg-sky-50 p-3 text-sky-700 hover:bg-sky-100"
      >
        Axtardığınız marka və ya model tapılmadı?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Marka / model əlavə et</DialogTitle>
            <DialogDescription>
              Axtardığınız markanı və ya marka + modeli yazıb göndərin. 1 gün ərzində sayta əlavə olunacaq.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="make-request-text" className="mb-1 block text-sm">
                Marka və ya marka + model *
              </label>
              <input
                id="make-request-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={100}
                autoFocus
                placeholder="Məs: Bajaj Pulsar NS200"
                className="w-full rounded-xl border bg-[#fafbff] p-3 text-[16px] focus:outline-sky-500"
              />
            </div>

            <div>
              <label htmlFor="make-request-email" className="mb-1 block text-sm">
                Email (könüllü)
              </label>
              <input
                id="make-request-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                placeholder="example@gmail.com"
                className="w-full rounded-xl border bg-[#fafbff] p-3 text-[16px] focus:outline-sky-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Əlavə olunanda xəbər almaq istəyirsinizsə, emailinizi yazın.
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full py-5"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? 'Göndərilir...' : 'Göndər'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
