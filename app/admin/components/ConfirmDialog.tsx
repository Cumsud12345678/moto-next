'use client'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  destructive?: boolean
  // true olsa, səbəb yazmaq üçün sahə göstərilir və onConfirm-ə ötürülür
  withReason?: boolean
  reasonPlaceholder?: string
  reasonRequired?: boolean
  onConfirm: (reason: string) => void | Promise<void>
}

// Bütün "əminsiniz?" pəncərələri üçün bir komponent
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Təsdiqlə',
  destructive = false,
  withReason = false,
  reasonPlaceholder = 'Səbəb (könüllü)',
  reasonRequired = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const disabled = busy || (withReason && reasonRequired && !reason.trim())

  const handleConfirm = async () => {
    if (disabled) return
    setBusy(true)
    try {
      await onConfirm(reason.trim())
      setReason('')
      onOpenChange(false)
    } catch {
      // Xəta mesajını çağıran tərəf göstərir; pəncərə açıq qalır ki, yenidən cəhd etmək olsun
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason('')
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {withReason && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            maxLength={300}
            rows={3}
            className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-sky-500"
          />
        )}

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={busy}>
            İmtina
          </AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? 'destructive' : 'default'}
            disabled={disabled}
            // Action pəncərəni özü bağlamır: sorğu bitənə qədər açıq qalır
            onClick={handleConfirm}
          >
            {busy ? 'Gözləyin...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
