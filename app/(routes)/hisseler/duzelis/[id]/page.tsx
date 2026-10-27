'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Spinner } from '@/components/ui/spinner'
import { getMyPart } from '@/lib/api/parts'
import { RootState } from '@/redux/store'
import type { PartRaw } from '@/types/part'
import PartForm from '../../_components/PartForm'

export default function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const user = useSelector((s: RootState) => s.user.user)
  const authLoading = useSelector((s: RootState) => s.user.loading)
  const authInitialized = useSelector((s: RootState) => s.user.initialized)

  const [part, setPart] = useState<PartRaw | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authInitialized || authLoading) return
    if (!user) {
      router.replace('/auth')
      return
    }
    getMyPart(id)
      .then(setPart)
      .catch(() => setError('Elan tapılmadı və ya sizə aid deyil'))
  }, [id, user, authLoading, authInitialized, router])

  if (error) return <div className='text-center mt-30 text-gray-500'>{error}</div>
  if (!part) return <div className='flex justify-center mt-30'><Spinner /></div>

  return <PartForm initial={part} />
}
