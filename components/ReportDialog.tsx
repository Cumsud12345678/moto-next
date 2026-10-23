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
import { reportListing, ReportCategory } from '@/lib/api/listings'
import { RootState } from '@/redux/store'

const CATEGORIES: { value: ReportCategory; label: string; hint: string }[] = [
  { value: 'fraud', label: 'Dolandırıcılıq', hint: 'Beh istəyir, saxta elan, başqasının şəkilləri' },
  { value: 'wrong_info', label: 'Səhv məlumat', hint: 'Qiymət, il, marka və ya parametrlər düz deyil' },
  { value: 'sold', label: 'Satılıb / aktual deyil', hint: 'Satıcı motosikletin satıldığını deyir' },
  { value: 'duplicate', label: 'Təkrar elan', hint: 'Eyni motosiklet bir neçə dəfə yerləşdirilib' },
  { value: 'inappropriate', label: 'Uyğunsuz məzmun', hint: 'Təhqir, reklam və ya motosikletə aid olmayan şəkil' },
  { value: 'other', label: 'Digər', hint: 'Səbəbi aşağıda yazın' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ReportDialogProps {
  listingId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Elan barədə şikayət: kateqoriya + email (məcburi) + izah
export default function ReportDialog({ listingId, open, onOpenChange }: ReportDialogProps) {
  const user = useSelector((state: RootState) => state.user.user)

  const [category, setCategory] = useState<ReportCategory | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const sendingRef = useRef(false)

  // Pəncərə açılanda giriş etmiş istifadəçinin emailini doldur
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCategory(null)
      setMessage('')
      setEmail(user?.email ?? '')
    }
  }

  const submit = async () => {
    if (sendingRef.current) return
    const cleanEmail = email.trim().toLowerCase()

    if (!category) return toast.add({ type: 'warning', description: 'Şikayət növünü seçin' })
    if (!EMAIL_RE.test(cleanEmail)) return toast.add({ type: 'warning', description: 'Emailinizi düzgün yazın' })
    if (category === 'other' && message.trim().length < 5) {
      return toast.add({ type: 'warning', description: 'Şikayətin səbəbini qısaca yazın' })
    }

    sendingRef.current = true
    setSending(true)
    try {
      const data = await reportListing(listingId, { category, message: message.trim(), email: cleanEmail })
      toast.add({ type: 'success', description: data.message })
      onOpenChange(false)
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.add({ type: 'error', description: msg || 'Şikayət göndərilmədi', priority: 'high' })
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Elanı şikayət et</DialogTitle>
          <DialogDescription>
            Şikayətiniz moderatorlara göndəriləcək. Satıcı kimin şikayət etdiyini görmür.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Şikayət növü">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={category === c.value}
              onClick={() => setCategory(c.value)}
              className={`flex flex-col rounded-xl border p-3 text-left transition-colors ${
                category === c.value ? 'border-blue-500 bg-blue-50' : 'bg-[#fafbff] hover:bg-gray-100'
              }`}
            >
              <span className="font-medium">{c.label}</span>
              <span className="text-xs text-gray-500">{c.hint}</span>
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="report-message" className="mb-1 block text-sm">
            Əlavə məlumat {category === 'other' ? '*' : '(könüllü)'}
          </label>
          <textarea
            id="report-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Nə baş verdiyini qısaca yazın"
            className="w-full rounded-xl border bg-[#fafbff] p-3 text-[16px] focus:outline-sky-500"
          />
        </div>

        <div>
          <label htmlFor="report-email" className="mb-1 block text-sm">Email *</label>
          <input
            id="report-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={100}
            placeholder="example@gmail.com"
            className="w-full rounded-xl border bg-[#fafbff] p-3 text-[16px] focus:outline-sky-500"
          />
          <p className="mt-1 text-xs text-gray-500">Lazım olsa sizinlə bu email vasitəsilə əlaqə saxlayacağıq.</p>
        </div>

        <Button size="lg" className="w-full py-5" onClick={submit} disabled={sending}>
          {sending ? 'Göndərilir...' : 'Şikayəti göndər'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
