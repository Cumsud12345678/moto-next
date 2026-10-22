'use client'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { RootState } from '@/redux/store'
import { Spinner } from '@/components/ui/spinner'

// proxy.ts yalnız cookie-nin olub-olmadığını yoxlayır. Bu komponent
// istifadəçinin həqiqətən admin olduğunu yoxlayır, admin deyilsə ana səhifəyə atır.
// (Əsl qoruma backend-dədir — bu, UI-nın boş yerə açılmaması üçündür.)
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.user.user)
  const loading = useSelector((state: RootState) => state.user.loading)
  const error = useSelector((state: RootState) => state.user.error)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (loading || error) return
    if (!user) router.replace('/auth')
    else if (!isAdmin) router.replace('/')
  }, [loading, error, user, isAdmin, router])

  if (!loading && error && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        Serverlə əlaqə qurulmadı. Səhifəni yeniləyin.
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return <>{children}</>
}
