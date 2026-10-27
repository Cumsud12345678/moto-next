'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, PencilToSquare, Plus, TrashBin } from '@gravity-ui/icons'
import { Trash2Icon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/toast'
import { deletePart, getMyParts } from '@/lib/api/parts'
import { partPath } from '@/lib/slug'
import { PART_CONDITION_LABEL, PartCard } from '@/types/part'

const formatNumber = (value: number) => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const STATUS_LABEL: Record<string, { label: string, className: string }> = {
  pending: { label: 'Yoxlanılır', className: 'bg-amber-500' },
  expired: { label: 'Müddəti bitib', className: 'bg-gray-500' },
  rejected: { label: 'Rədd edilib', className: 'bg-red-500' },
  blocked: { label: 'Bloklanıb', className: 'bg-red-600' },
  sold: { label: 'Satılıb', className: 'bg-gray-500' },
}

// Profildə "Hissələr" tabı: istifadəçinin ehtiyat hissəsi elanları
export default function MyParts() {
  const [parts, setParts] = useState<PartCard[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<PartCard | null>(null)

  useEffect(() => {
    let alive = true
    getMyParts()
      .then((data) => { if (alive) setParts(data) })
      .catch(() => toast.add({ type: 'error', description: 'Hissə elanları yüklənmədi' }))
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const handleDelete = (id: string) => {
    const prev = parts
    setParts((p) => p.filter((x) => x._id !== id))
    toast.promise(deletePart(id), {
      loading: 'Elan silinir',
      success: (data) => data.message,
      error: () => {
        setParts(prev)
        return 'Elan silinmədi, yenidən cəhd edin'
      },
    })
  }

  return (
    <div>
      <div className='flex justify-end mb-3'>
        <Link href='/hisseler/yeni' className='flex items-center gap-1.5 bg-green-500 text-white rounded-lg px-3 py-2'>
          <Plus className='size-4' />
          Hissə elanı yerləşdir
        </Link>
      </div>

      {loading ? (
        <div className='text-center py-10 text-gray-400'>Yüklənir...</div>
      ) : parts.length === 0 ? (
        <div className='text-center py-10 text-gray-400'>Ehtiyat hissəsi elanınız yoxdur.</div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {parts.map((part) => {
            const status = part.status && part.status !== 'active' ? STATUS_LABEL[part.status] : null
            return (
              <div key={part._id} className='rounded-lg overflow-hidden bg-white shadow border-2'>
                <Link href={status ? '#' : partPath(part.title, part._id)} className='block'>
                  <div className='relative aspect-4/3 overflow-hidden bg-gray-100'>
                    {part.images?.[0] && (
                      <Image src={`${process.env.NEXT_PUBLIC_IMAGE_URL}/${part.images[0]}`} alt={part.title} fill className='object-cover' />
                    )}
                    {status && (
                      <div className={`absolute top-0 left-0 z-10 text-white text-sm px-1.5 py-0.5 rounded-br-lg ${status.className}`}>{status.label}</div>
                    )}
                    <div className='absolute bottom-0 left-0 z-10 m-2 bg-gray-700/80 text-white rounded-lg px-1.5 text-[12px]'>
                      {PART_CONDITION_LABEL[part.condition]}
                    </div>
                  </div>
                  <div className='p-2'>
                    <span className='text-xl text-green-500 font-bold'>{formatNumber(part.price)} ₼</span>
                    <p className='text-[16px] truncate'>{part.title}</p>
                    <p className='text-[14px] text-gray-400 truncate'>{part.region?.label}, {part.createdAt}</p>
                    <p className='text-[14px] text-gray-500 flex items-center gap-1 mt-0.5'>
                      <Eye className='size-4' />
                      {formatNumber(part.viewCount ?? 0)} baxış
                    </p>
                  </div>
                </Link>
                <div className='flex flex-col sm:flex-row gap-2 px-2 pb-2'>
                  <Link href={`/hisseler/duzelis/${part._id}`} className='w-full flex items-center justify-center gap-3 bg-blue-500 text-white p-2 rounded-lg'>
                    <PencilToSquare />
                    Düzəlt
                  </Link>
                  <button onClick={() => setDeleteTarget(part)} className='w-full flex items-center justify-center gap-3 bg-red-500 text-white p-2 rounded-lg cursor-pointer'>
                    <TrashBin />
                    Sil
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive'>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Elanı silmək istəyirsiniz?</AlertDialogTitle>
            <AlertDialogDescription>Bu əməliyyat geri qaytarıla bilməz, elan tam silinəcək.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant='outline'>Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={() => {
                if (deleteTarget) handleDelete(deleteTarget._id)
                setDeleteTarget(null)
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
