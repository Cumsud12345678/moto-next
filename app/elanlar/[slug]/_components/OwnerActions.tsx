'use client'
import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Eye, PencilToSquare, TrashBin } from '@gravity-ui/icons'
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
import { toast } from '@/components/ui/toast'
import { deleteListing } from '@/lib/api/listings'
import { deletePart } from '@/lib/api/parts'
import { RootState } from '@/redux/store'

// Giriş etmiş istifadəçi öz elanına baxırsa: "Düzəliş et" və "Sil"
// Server HTML-də istifadəçi bilinmir; hydration uyğunsuzluğu olmasın deyə yalnız brauzerdə yoxlanılır
const noopSubscribe = () => () => {}
export function useIsOwner(sellerId?: string) {
  const user = useSelector((state: RootState) => state.user.user)
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return hydrated && !!user?._id && !!sellerId && String(user._id) === String(sellerId)
}

interface OwnerActionsProps {
  listingId: string
  sellerId?: string
  viewCount?: number
  className?: string
  // 'part' — ehtiyat hissəsi elanı (fərqli düzəliş səhifəsi və silmə endpoint-i)
  kind?: 'listing' | 'part'
}

export default function OwnerActions({ listingId, sellerId, viewCount, className = '', kind = 'listing' }: OwnerActionsProps) {
  const isOwner = useIsOwner(sellerId)
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!isOwner) return null

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      const data = kind === 'part' ? await deletePart(listingId) : await deleteListing(listingId)
      toast.add({ type: 'success', description: data?.message || 'Elan silindi' })
      setConfirmOpen(false)
      router.replace(kind === 'part' ? '/profile?tab=parts' : '/profile')
    } catch {
      toast.add({ type: 'error', description: 'Elan silinmədi, yenidən cəhd edin', priority: 'high' })
      setDeleting(false)
    }
  }

  return (
    <>
      <div className={className}>
      {viewCount !== undefined && (
        <p className="mb-2 flex items-center gap-1.5 text-gray-500">
          <Eye className="size-4" />
          Elanınıza {viewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} dəfə baxılıb
        </p>
      )}
      <div className="flex gap-3">
        <Link
          href={kind === 'part' ? `/hisseler/duzelis/${listingId}` : `/edit/${listingId}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500 p-3 font-medium text-white"
        >
          <PencilToSquare className="size-5" />
          Düzəliş et
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 font-medium text-red-600 cursor-pointer"
        >
          <TrashBin className="size-5" />
          Sil
        </button>
      </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !deleting && setConfirmOpen(open)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Elan silinsin?</AlertDialogTitle>
            <AlertDialogDescription>
              {kind === 'part' ? 'Elan və şəkilləri' : 'Elan, şəkilləri və videosu'} birdəfəlik silinəcək. Bu əməliyyatı geri qaytarmaq olmur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={deleting}>İmtina</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Silinir...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
